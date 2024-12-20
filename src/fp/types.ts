import type { Fn } from '../types'

export type IComposeResult<T extends Fn> = T & {
  exec(...params: Parameters<T>): ReturnType<T>
}

export interface ICompose {
  <I, M1, O>(fn1: Fn<M1, [I]>, fn2: Fn<O, [M1]>): IComposeResult<(i: I) => O>
  <I, M1, M2, O>(fn1: Fn<M1, [I]>, fn2: Fn<M2, [M1]>, fn3: Fn<O, [M2]>): IComposeResult<(i: I) => O>
  <I, M1, M2, M3, O>(
    fn1: Fn<M1, [I]>,
    fn2: Fn<M2, [M1]>,
    fn3: Fn<M3, [M2]>,
    fn4: Fn<O, [M3]>,
  ): IComposeResult<(i: I) => O>
  <I, M1, M2, M3, M4, O>(
    fn1: Fn<M1, [I]>,
    fn2: Fn<M2, [M1]>,
    fn3: Fn<M3, [M2]>,
    fn4: Fn<M4, [M3]>,
    fn5: Fn<O, [M4]>,
  ): IComposeResult<(i: I) => O>
  <I, M1, M2, M3, M4, M5, O>(
    fn1: Fn<M1, [I]>,
    fn2: Fn<M2, [M1]>,
    fn3: Fn<M3, [M2]>,
    fn4: Fn<M4, [M3]>,
    fn5: Fn<M5, [M4]>,
    fn6: Fn<O, [M5]>,
  ): IComposeResult<(i: I) => O>
  <I, M1, M2, M3, M4, M5, M6, O>(
    fn1: Fn<M1, [I]>,
    fn2: Fn<M2, [M1]>,
    fn3: Fn<M3, [M2]>,
    fn4: Fn<M4, [M3]>,
    fn5: Fn<M5, [M4]>,
    fn6: Fn<M6, [M5]>,
    fn7: Fn<O, [M6]>,
  ): IComposeResult<(i: I) => O>
  <I, M1, M2, M3, M4, M5, M6, M7, O>(
    fn1: Fn<M1, [I]>,
    fn2: Fn<M2, [M1]>,
    fn3: Fn<M3, [M2]>,
    fn4: Fn<M4, [M3]>,
    fn5: Fn<M5, [M4]>,
    fn6: Fn<M6, [M5]>,
    fn7: Fn<M7, [M6]>,
    fn8: Fn<O, [M7]>,
  ): IComposeResult<(i: I) => O>
  <I, M1, M2, M3, M4, M5, M6, M7, M8, O>(
    fn1: Fn<M1, [I]>,
    fn2: Fn<M2, [M1]>,
    fn3: Fn<M3, [M2]>,
    fn4: Fn<M4, [M3]>,
    fn5: Fn<M5, [M4]>,
    fn6: Fn<M6, [M5]>,
    fn7: Fn<M7, [M6]>,
    fn8: Fn<M8, [M7]>,
    fn9: Fn<O, [M8]>,
  ): IComposeResult<(i: I) => O>
  <I, M1, M2, M3, M4, M5, M6, M7, M8, M9, O>(
    fn1: Fn<M1, [I]>,
    fn2: Fn<M2, [M1]>,
    fn3: Fn<M3, [M2]>,
    fn4: Fn<M4, [M3]>,
    fn5: Fn<M5, [M4]>,
    fn6: Fn<M6, [M5]>,
    fn7: Fn<M7, [M6]>,
    fn8: Fn<M8, [M7]>,
    fn9: Fn<M9, [M8]>,
    fn10: Fn<O, [M9]>,
  ): IComposeResult<(i: I) => O>
  <I, M1, M2, M3, M4, M5, M6, M7, M8, M9, M10, O>(
    fn1: Fn<M1, [I]>,
    fn2: Fn<M2, [M1]>,
    fn3: Fn<M3, [M2]>,
    fn4: Fn<M4, [M3]>,
    fn5: Fn<M5, [M4]>,
    fn6: Fn<M6, [M5]>,
    fn7: Fn<M7, [M6]>,
    fn8: Fn<M8, [M7]>,
    fn9: Fn<M9, [M8]>,
    fn10: Fn<M10, [M9]>,
    fn11: Fn<O, [M10]>,
  ): IComposeResult<(i: I) => O>
}
