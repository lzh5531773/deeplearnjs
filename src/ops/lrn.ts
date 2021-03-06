/**
 * @license
 * Copyright 2018 Google Inc. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */

import {operation} from './operation';
import {doc} from '../doc';
import {ENV} from '../environment';
import {Tensor3D, Tensor4D} from '../tensor';
import * as util from '../util';

export class LRN {
  /**
   * Normalizes the activation of a local neighborhood across or within
   * channels.
   *
   * @param x The input Tensor. The 4-D input tensor is treated as a 3-D array
   *     of 1D vectors (along the last dimension), and each vector is
   *     normalized independently.
   * @param radius The number of adjacent channels or spatial locations of the
   *     1D normalization window. In Tensorflow this param is called
   *     'depth_radius' because only 'acrossChannels' mode is supported.
   * @param bias A constant bias term for the basis.
   * @param alpha A scale factor, usually positive.
   * @param beta An exponent.
   * @param normRegion A string from: ['acrossChannels', 'withinChannel'].
   *     Default is 'acrossChannels'.
   */
  @doc({heading: 'Operations', subheading: 'Normalization'})
  @operation
  static localResponseNormalization<T extends Tensor3D|Tensor4D>(
      x: T, radius = 5, bias = 1, alpha = 1, beta = 0.5,
      normRegion: 'acrossChannels'|'withinChannel' = 'acrossChannels'): T {
    util.assert(
        x.rank === 4 || x.rank === 3,
        `Error in localResponseNormalization: x must be rank 3 or 4 but got
               rank ${x.rank}.`);
    util.assert(
        util.isInt(radius),
        `Error in localResponseNormalization3D: radius must be an integer
                     but got radius ${radius}.`);
    let x4D = x as Tensor4D;
    let reshapedTo4D = false;
    if (x.rank === 3) {
      reshapedTo4D = true;
      x4D = x.as4D(1, x.shape[0], x.shape[1], x.shape[2]);
    }
    const res = ENV.engine.executeKernel(
        'LRN4D',
        {inputs: {x: x4D}, args: {radius, bias, alpha, beta, normRegion}});
    if (reshapedTo4D) {
      return res.as3D(res.shape[1], res.shape[2], res.shape[3]) as T;
    } else {
      return res as T;
    }
  }
}
