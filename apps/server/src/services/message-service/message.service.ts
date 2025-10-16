import { MessageState, runtimeStorePlaceholder } from 'ontime-types';
import { DeepPartial } from 'ts-essentials';

import { throttle } from '../../utils/throttle.js';
import type { StoreGetter, PublishFn } from '../../stores/EventStore.js';

/**
 * Create a throttled version of the set function
 */
let throttledSet: PublishFn = () => undefined;
let storeGet: StoreGetter = (_key: string) => undefined;

/**
 * Allows providing store interfaces
 */
export function init(storeSetter: PublishFn, storeGetter: StoreGetter) {
  throttledSet = throttle(storeSetter, 100);
  storeGet = storeGetter;
}

/**
 * Exposes function to reset the internal state
 */
export function clear() {
  throttledSet('message', {
    ...runtimeStorePlaceholder.message,
  });
}

/**
 * Exposes the internal state of the message service
 */
export function getState(): MessageState {
  // we know this exists at runtime
  return storeGet('message') as MessageState;
}

/**
 * Utility function allows patching internal object
 */
export function patch(patch: DeepPartial<MessageState>): MessageState {
  // make a copy of the state in store
  const newState = { ...getState() };

  if ('timer' in patch) newState.timer = { ...newState.timer, ...patch.timer };
  if ('secondary' in patch && patch.secondary !== undefined) newState.secondary = patch.secondary;
  if ('aux1label' in patch && patch.aux1label !== undefined) newState.aux1label = patch.aux1label;
  if ('aux2label' in patch && patch.aux2label !== undefined) newState.aux2label = patch.aux2label;
  if ('aux3label' in patch && patch.aux3label !== undefined) newState.aux3label = patch.aux3label;

  throttledSet('message', newState);
  return newState;
}
