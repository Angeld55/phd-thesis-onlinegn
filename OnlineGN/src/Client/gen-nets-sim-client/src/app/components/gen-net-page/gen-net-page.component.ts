import { Component, Input } from '@angular/core';
import {
  GenNetService,
  getGenNetGraphDataFromGenNetRaw,
  getTokensFromGenNetRaw,
} from './../../services/gen-net.service';
import { GenNetRaw, TransitionItem } from './../../models/gen-net.model';
import { GenNetGraphData, MovingToken } from './../../models/graph-data.model';
import {
  GraphEngineService,
  GraphEngineServiceFactory,
} from './../../services/graph-engine.service';
import { MatDialog } from '@angular/material/dialog';
import {
  PlaceDialogComponent,
  PlaceDialogData,
} from '../dialogs/place-dialog/place-dialog.component';
import {
  CodeCompilerService,
  CodeCompilerServiceFactory,
} from './../../services/code-compiler.service';
import { GenNetExportModel } from './../../models/gen-net-export.model';
import {
  TransitionDialogComponent,
  TransitionDialogData,
} from '../dialogs/transition-dialog/transition-dialog.component';
import { TokenTrackerMap } from './../../services/token-tracker.service';
import { GenNetSettings } from './../../models/get-net-settings.model';
import { BASE_MODAL_CONFIG } from './../../utils/base-modal.config';
import {
  TokenMove,
  TokenMoverService,
} from './../../services/token-mover.service';
import { deepCopy } from './../../utils/deep-copy';
import { BaseComponent } from './../../utils/base-component';
import {
  D3_CONTAINER_SELECTOR,
  MOCK_GLOBAL_CODE,
} from './../../utils/contants';
import { generateGraphVizString } from './../../graph-viz/graph-viz-string-generator';
import { AlgorithmInput } from './../../graph-viz/algorithm-input.model';
import { environment } from 'src/environments/environment';
import { ExecutedMovesTracker } from './../../services/executed-moves-tracker.service';
import { switchMap } from 'rxjs';
import { StepLoggerService } from './../../services/step-logger.service';
import { GenNetHttpService } from 'src/app/services/gen-net-http.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'gen-net-page',
  templateUrl: './gen-net-page.component.html',
  styleUrls: ['./gen-net-page.component.scss'],
})
export class GenNetPageComponent extends BaseComponent {
  private readonly d3ContainerSelector = D3_CONTAINER_SELECTOR;
  protected settings: GenNetSettings | null = null;
  protected genNetRaw: GenNetRaw | null = null;
  protected codeCompilerService: CodeCompilerService | null = null;
  protected genNetGraphData: GenNetGraphData | null = null;
  protected graphEngine: GraphEngineService | null = null;

  protected currentStep: number = 0;
  private executedMovesTracker = new ExecutedMovesTracker();

  @Input() public genNetId: string = '';

  constructor(
    private genNetService: GenNetService,
    private graphEngineServiceFactory: GraphEngineServiceFactory,
    private codeCompilerServiceFactory: CodeCompilerServiceFactory,
    private dialog: MatDialog,
    private tokenMover: TokenMoverService,
    private stepLoggerService: StepLoggerService,
    private genNetHttpService: GenNetHttpService,
    private toastr: ToastrService,
  ) {
    super();
  }

  ngOnInit(): void {
    if (this.genNetId) {
      this.genNetHttpService.getGenNetById(this.genNetId).subscribe({
        next: (model) => {
          this.initialize(model);
        },
        error: (err) => {
          this.toastr.error(
            'Error loading GenNet. Please check the ID and try again.',
          );
        },
      });
    } else if (!environment.production) {
      // testing data
      this.initialize({
        genNetRaw: this.genNetService.getGenNetMock(),
        settings: {
          simulationSettings: {
            stepDurationMS: 5000,
          },
        },
        code: MOCK_GLOBAL_CODE,
      });
    }
  }

  public initialize(model: GenNetExportModel) {
    this.stepLoggerService.clear();
    this.executedMovesTracker.resetCounter();
    this.initEngine(model, () => {
      this.settings = model.settings;

      this.codeCompilerService = this.codeCompilerServiceFactory.create(
        this.tokenMover,
        model.code,
        this.genNetRaw!,
      );
      this.currentStep = 0;

      this.untilDispose(this.graphEngine!.nodeClicked).subscribe((node) => {
        if (this.showPositionChanger) {
          return;
        }
        if (node.type === 'transition') {
          this.openTransitionDialog(node);
        } else {
          this.openPlaceDialog(node);
        }
      });
    });
  }

  public openPlaceDialog(node: any) {
    const place = this.genNetGraphData!.placeMap[node.name];
    this.dialog.open(PlaceDialogComponent, {
      ...BASE_MODAL_CONFIG,
      data: {
        functions: this.codeCompilerService?.customFunctions,
        currentPlace: place,
        tokens: this.tokenMover.getTokensAtPlace(place.id),
      } as PlaceDialogData,
    });
  }

  public openTransitionDialog(transition: any) {
    const t = this.genNetGraphData?.transitions[transition.name];
    this.dialog.open(TransitionDialogComponent, {
      ...BASE_MODAL_CONFIG,
      data: {
        functions: this.codeCompilerService?.customFunctions,
        currentTransition: t,
      } as TransitionDialogData,
    });
  }

  private prepareGraphVizAlgorithmInput(): AlgorithmInput {
    const result: AlgorithmInput = {
      places: [],
    };

    for (const placeId in this.genNetGraphData!.placeMap) {
      result.places.push({
        name: placeId,
        beginTransition:
          this.genNetGraphData!.placeIdToPreviousTransitionId[placeId],
        endTransition: this.genNetGraphData!.placeIdToTransitionId[placeId],
      });
    }
    return result;
  }

  private initEngine(model: GenNetExportModel, callback: Function): void {
    this.graphEngine = this.graphEngineServiceFactory.create(
      this.d3ContainerSelector,
      model.settings.simulationSettings,
    );
    this.genNetRaw = model.genNetRaw;
    this.genNetGraphData = getGenNetGraphDataFromGenNetRaw(this.genNetRaw!);

    const afterLoadCallback = () => {
      this.tokenMover.reset(this.graphEngine!, this.calculateTokensInPlaces());
      callback();
    };
    if (!model.svg) {
      const input = this.prepareGraphVizAlgorithmInput();
      const graphVizString = generateGraphVizString(input);
      this.graphEngine!.loadFromDotString(
        graphVizString,
        afterLoadCallback,
        this.genNetGraphData!.placeIdToTransitionId,
      );
    } else {
      this.graphEngine!.loadFromSvg(model.svg, afterLoadCallback);
    }
  }

  private calculateTokensInPlaces(): TokenTrackerMap {
    const result: TokenTrackerMap = {};

    this.genNetRaw!.places.forEach((place) => {
      result[place.id] = new Set<MovingToken>();
    });

    this.genNetGraphData!.tokens.forEach((token) => {
      result[token.currentPositionsId].add(token);
    });

    return result;
  }

  private canSplitTokenAtTransition(
    token: MovingToken,
    transitionId: string,
  ): boolean {
    const transition = this.genNetGraphData!.transitions[transitionId];
    if (!transition.splitFunction) {
      return false;
    }

    return !!this.codeCompilerService!.executeCustomFunction<boolean>(
      transition.splitFunction,
      token,
    );
  }

  private mergeTokensAtPlace(placeId: string) {
    const place = this.genNetGraphData!.placeMap[placeId];
    if (!place.mergeFunction) {
      return;
    }

    const tokens = this.tokenMover.getTokensAtPlace(placeId);
    const newTokens = this.codeCompilerService!.executeCustomFunction<
      Array<MovingToken>
    >(place.mergeFunction, Array.from(tokens));

    if (newTokens && newTokens.length > 0) {
      newTokens?.forEach((token) => {
        token.currentPositionsId = placeId;
      });
      this.tokenMover.setTokensAtPlace(placeId, new Set(newTokens));
    }
  }

  private registerAllMoves() {
    // now we register source to transition moves
    // we return this array which will point to all the moves transition to place
    // they should be executed next
    const nextTokenMoves: TokenMove[] = [];
    this.genNetGraphData!.transitionsSortedByPriority.forEach((transition) => {
      this.stepLoggerService.add(`Processing transition ${transition.id}`);
      const sourcePlaces =
        this.genNetGraphData!.transitionToSourcePlaces[transition.id];
      if (!sourcePlaces) {
        return;
      }
      sourcePlaces.sort((a, b) => b.priority - a.priority);

      this.stepLoggerService.add(`Processing source places by priority`);
      sourcePlaces.forEach((sourcePlace) => {
        this.stepLoggerService.add(
          `-- Processing tokens at source place ${sourcePlace.id} by priority`,
        );
        const tokens = this.tokenMover.getTokensAtPlace(sourcePlace.id);
        if (tokens.size === 0) {
          this.stepLoggerService.add(
            `-- No tokens at source place ${sourcePlace.id}`,
          );
          return;
        }
        const tokensArray = Array.from(tokens).sort(
          (a, b) => b.priority - a.priority,
        );

        tokensArray.forEach((token) => {
          this.stepLoggerService.add(`---- Processing token ${token.id}`);
          const transitionItemsForSource =
            this.genNetGraphData!.placeIdToTransitionItems[sourcePlace.id];

          const possibleMoves = transitionItemsForSource
            .filter((tItem) => this.canTokenContinue(token, tItem))
            .sort((move1, move2) => {
              const place1 = this.genNetGraphData!.placeMap[move1.target];
              const place2 = this.genNetGraphData!.placeMap[move2.target];
              return place2.priority - place1.priority;
            });

          if (possibleMoves.length === 0) {
            this.stepLoggerService.add(
              `---- No possible moves for token ${token.id}`,
            );
            return;
          }
          // token will be moved for sure
          this.tokenMover.addTokenMove({
            sourceId: sourcePlace.id,
            targetId: transition.id,
            token: token,
          });

          if (
            possibleMoves.length == 1 ||
            !this.canSplitTokenAtTransition(token, transition.id)
          ) {
            this.stepLoggerService.add(
              `---- Registering only one possible move for token ${token.id} to ${possibleMoves[0].target}`,
            );
            nextTokenMoves.push({
              sourceId: transition.id,
              targetId: possibleMoves[0].target,
              token: token,
            });
            this.executedMovesTracker.addMove(
              sourcePlace.id,
              possibleMoves[0].target,
            );
          } else {
            this.stepLoggerService.add(
              `---- Registering multiple possible moves for token ${token.id}. Token will be split.`,
            );
            // possibleMoves.length > 1 and token can be split
            possibleMoves.forEach((transitionItem, index) => {
              const childToken = this.createChildToken(token, index);
              nextTokenMoves.push({
                sourceId: transition.id,
                targetId: transitionItem.target,
                token: childToken,
              });
              this.executedMovesTracker.addMove(
                sourcePlace.id,
                transitionItem.target,
              );
              this.stepLoggerService.add(
                `------ New child token ${childToken.id} to ${transitionItem.target}`,
              );
            });
          }
        });
      });
    });

    return nextTokenMoves;
  }

  private canTokenContinue(token: MovingToken, tItem: TransitionItem) {
    return (
      this.hasEdgeCapacity(tItem) &&
      this.hasTargetPlaceCapacity(tItem.target) &&
      this.shouldTokenContinue(token, tItem)
    );
  }

  protected makeStep() {
    this.stepLoggerService.clear();
    this.currentStep++;
    this.stepLoggerService.add(`!!!Starting step ${this.currentStep}`);
    // nextTokenMoves will be executed after all source to transition moves
    // nextTokenMoves represent all moves from transition to place
    const nextTokenMoves = this.registerAllMoves();
    if (!this.tokenMover.hasMoves()) {
      this.stepLoggerService.add(
        `!!!Finish step ${this.currentStep}: No available moves`,
      );
      return false;
    }

    this.stepLoggerService.add(`Executing registered moves`);
    // done at two steps
    // 1. place to transition
    // 2. transition to place
    this.untilComplete(this.tokenMover.move())
      .pipe(
        switchMap((_) => {
          nextTokenMoves.forEach((move) => {
            this.tokenMover.addTokenMove(move);
          });
          return this.untilComplete(this.tokenMover.move());
        }),
      )
      .subscribe((executedMoves) => {
        for (const sourceId in executedMoves) {
          for (const targetId in executedMoves[sourceId]) {
            const move = executedMoves[sourceId][targetId];
            this.updateTokenChars(move.tokens);
            // TODO: currently we remove the merging
            //this.mergeTokensAtPlace(targetId);
          }
        }

        this.stepLoggerService.add(
          `!!!Finish step ${this.currentStep}: All moves executed`,
        );
        this.executedMovesTracker.resetCounter();
      });

    return true;
  }

  private hasEdgeCapacity(transitionItem: TransitionItem) {
    return (
      transitionItem.capacity >
      this.executedMovesTracker.getCount(
        transitionItem.source,
        transitionItem.target,
      )
    );
  }

  private hasTargetPlaceCapacity(placeId: string) {
    const place = this.genNetGraphData!.placeMap[placeId];
    return (
      place.capacity >
      this.tokenMover.getTokensAtPlace(placeId).size -
        this.executedMovesTracker.getCountForSource(placeId) +
        this.executedMovesTracker.getCountToTarget(placeId)
    );
  }

  private shouldTokenContinue(token: MovingToken, tItem: TransitionItem) {
    return (
      !tItem.predicate ||
      this.codeCompilerService!.executeCustomFunction<boolean>(
        tItem.predicate,
        token,
      )
    );
  }

  private createChildToken(token: MovingToken, index: number): MovingToken {
    const newToken = deepCopy(token);
    newToken.id = token.id + '_' + index;
    newToken.name = token.name + '_' + index;
    return newToken;
  }

  protected fullSimulation() {
    const stepResult = this.makeStep();
    if (stepResult) {
      setTimeout(
        () => this.fullSimulation(),
        this.graphEngine!.stepDurationMS + 100,
      );
    }
  }

  protected resetSimulation() {
    this.genNetGraphData!.tokens = getTokensFromGenNetRaw(this.genNetRaw!);
    this.tokenMover.reset(this.graphEngine!, this.calculateTokensInPlaces());
    this.currentStep = 0;
  }

  protected showPositionChanger: boolean = false;
  protected editPositions() {
    this.showPositionChanger = !this.showPositionChanger;
  }

  private updateTokenChars(tokens: Set<MovingToken>) {
    tokens.forEach((token) => {
      const targetPlaceCharFunc =
        this.genNetGraphData!.placeMap[token.currentPositionsId]?.charFunc;

      if (targetPlaceCharFunc) {
        this.codeCompilerService!.executeCustomFunction(
          targetPlaceCharFunc,
          token,
        );
      }

      this.stepLoggerService.add(
        `Token ${token.id} moved to ${token.currentPositionsId}. Characteristics have been updated.`,
      );
    });
  }

  // Splitter Logic
  protected leftPanelWidth: number = 800; // Initial width
  private isDraggingSplitter: boolean = false;

  protected onMouseDown() {
    this.isDraggingSplitter = true;
  }

  protected onMouseMove(event: MouseEvent) {
    if (!this.isDraggingSplitter) {
      return;
    }
    // Prevent text selection while dragging
    event.preventDefault();
    
    // Calculate new width based on mouse position
    // We can adjust this logic if the layout is more complex, 
    // but for a simple left-to-right split, clientX works well.
    // We might need to subtract the sidebar offset if there was one, 
    // but here the main content starts at the left edge (mostly).
    // A minimum width check is good practice.
    const newWidth = event.clientX - 20; // -20 for padding/margin adjustments if needed
    if (newWidth > 300 && newWidth < window.innerWidth - 300) {
       this.leftPanelWidth = newWidth;
    }
  }

  protected onMouseUp() {
    this.isDraggingSplitter = false;
  }

  override ngOnDestroy(): void {
    super.ngOnDestroy();
    this.tokenMover?.dispose();
  }
}
