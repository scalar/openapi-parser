import type { Queue } from '../pipeline'
import type { DereferenceResult, Filesystem } from '../types'
import { makeFilesystem } from './makeFilesystem'

/**
 * Run through a queue of tasks
 */
export async function workThroughQueue(queue: Queue): // TODO: Better type
Promise<
  Partial<
    DereferenceResult & {
      filesystem: Filesystem
    }
  >
> {
  let specification = queue.specification

  // TODO: Be more specific
  let result: any

  // Run through all tasks in the queue
  for (const { action, options } of queue.tasks) {
    // Check if action is a function
    if (typeof action !== 'function') {
      console.warn('[queue] The given action is not a function:', action)
      continue
    }

    // Check if the action is an async function
    if (action.constructor.name === 'AsyncFunction') {
      result = {
        ...result,
        ...(await action(result?.filesystem ?? specification, options as any)),
      }
    } else {
      result = {
        ...result,
        ...action(result?.filesystem ?? specification, options as any),
      }
    }
  }

  /**
   * TODO: This is a terrible hack. All functions should return the same format, but they don’t.
   * The dereference function returns a DereferenceResult, but others return a Filesystem.
   */
  // const isMoreThanJustTheSpecification = Object.keys(specification).includes(
  //   'specificationVersion',
  // )

  return result
  // return isMoreThanJustTheSpecification
  //   ? (specification as any)
  //   : makeFilesystem(specification as Filesystem)
}
