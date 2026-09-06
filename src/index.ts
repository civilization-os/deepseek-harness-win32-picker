/** Windows native folder-picker provider for DeepSeek Harness. */

import { Service, type Context } from '@deepseek-ai/cordis'
import { pickWin32Directory } from './win32-dialog.ts'

/** Cordis plugin name. */
export const name = 'win32-directory-picker'

/** Native directory-picker capability consumed by the DSH workspace UI. */
export interface NativeDirectoryPickerCapability {
  kind: 'native'
  pick(signal: AbortSignal): Promise<string | null>
}

/** Register a Windows `IFileOpenDialog` provider as `ctx.directoryPicker`. */
export default class Win32DirectoryPicker extends Service {
  private readonly nativeCapability: NativeDirectoryPickerCapability = {
    kind: 'native',
    pick: signal => pickWin32Directory(signal),
  }

  /**
   * @param ctx - Cordis context that owns the service lifetime.
   */
  constructor(ctx: Context) {
    if (process.platform !== 'win32') {
      throw new Error('deepseek-harness-win32-picker requires Windows')
    }
    super(ctx, 'directoryPicker')
  }

  /**
   * Return the stable native picker capability.
   * @returns the capability used by the DSH workspace UI.
   */
  capability(): NativeDirectoryPickerCapability {
    return this.nativeCapability
  }
}

export { pickWin32Directory } from './win32-dialog.ts'
