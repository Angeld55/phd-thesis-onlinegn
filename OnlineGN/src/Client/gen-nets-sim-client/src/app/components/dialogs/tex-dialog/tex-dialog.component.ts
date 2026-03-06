import { Component } from '@angular/core';
import { convertEdgesToML, svgToTeX } from './utils/svg-to-tex';
import { D3_CONTAINER_SELECTOR } from 'src/app/utils/contants';

@Component({
  selector: 'tex-dialog',
  templateUrl: './tex-dialog.component.html',
  styleUrls: ['./tex-dialog.component.scss'],
})
export class TexDialogComponent {
  protected placeLabelOffsetFactor: number = 0.85;
  protected transitionLabelVerticalOffset: number = 3.75;
  protected lengthScaleFactor: number = 0.5;
  protected fixedPlaceRadius: number = 5;

  protected texOutput: string = '';

  protected generateTex() {
    const svg = document.querySelector(`${D3_CONTAINER_SELECTOR}>g>svg`);
    const svgString = svg!.outerHTML;
    const fixedSvg = convertEdgesToML(svgString);
    this.texOutput = svgToTeX(
      fixedSvg,
      this.placeLabelOffsetFactor,
      this.transitionLabelVerticalOffset,
      this.lengthScaleFactor,
      this.fixedPlaceRadius,
    );
  }
}
