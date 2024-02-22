import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {NumberMinDigitPipe} from './number-min-digit.pipe';
import {SecToTimePipe} from './sec-to-time.pipe';


@NgModule({
  declarations: [
    NumberMinDigitPipe,
    SecToTimePipe
   ],
  imports: [
    CommonModule
  ],
  exports: [
    NumberMinDigitPipe,
    SecToTimePipe
  ]
})
export class PipesModule {
}
