import { GenNetRaw } from './gen-net.model';
import { GenNetSettings } from './get-net-settings.model';

export interface GenNetExportModel {
  genNetRaw: GenNetRaw;
  settings: GenNetSettings;
  code: string;
  svg?: string;
}
