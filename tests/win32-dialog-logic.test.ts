import assert from 'node:assert/strict'
import test from 'node:test'
import {
  FOS_FORCEFILESYSTEM,
  FOS_NOCHANGEDIR,
  FOS_PICKFOLDERS,
  HRESULT_CANCELLED,
  runFolderDialog,
  type Win32DialogBindings,
} from '../src/win32-dialog-logic.ts'

function fixture(showResult = 0) {
  const calls: string[] = []
  const owner = { window: 'foreground' }
  const dialog = {
    setOptions(options: number) {
      assert.equal(options, FOS_PICKFOLDERS | FOS_FORCEFILESYSTEM | FOS_NOCHANGEDIR)
      calls.push('options')
      return 0
    },
    setTitle(title: string) {
      assert.equal(title, 'Select Workspace Directory')
      calls.push('title')
      return 0
    },
    show(actualOwner: unknown) {
      assert.equal(actualOwner, owner)
      calls.push('show')
      return showResult
    },
    resultPath() {
      calls.push('result')
      return { hr: 0, path: 'C:\\workspace' }
    },
    release() {
      calls.push('release')
    },
  }
  const bindings: Win32DialogBindings = {
    setThreadDpiAwareness() { calls.push('dpi') },
    coInitializeSta() { calls.push('initialize'); return 0 },
    coUninitialize() { calls.push('uninitialize') },
    createFolderDialog() { calls.push('create'); return dialog },
    foregroundWindow() { calls.push('foreground'); return owner },
    currentThreadId() { calls.push('thread'); return 42 },
  }
  return { bindings, calls }
}

test('owns the chooser to the foreground window and releases COM resources', () => {
  const { bindings, calls } = fixture()
  const showing: number[] = []
  assert.equal(runFolderDialog(bindings, 'Select Workspace Directory', id => showing.push(id)), 'C:\\workspace')
  assert.deepEqual(showing, [42])
  assert.deepEqual(calls, [
    'dpi', 'initialize', 'create', 'options', 'title', 'thread',
    'foreground', 'show', 'result', 'release', 'uninitialize',
  ])
})

test('maps a dismissed chooser to null and still releases COM resources', () => {
  const { bindings, calls } = fixture(HRESULT_CANCELLED)
  assert.equal(runFolderDialog(bindings, 'Select Workspace Directory', () => undefined), null)
  assert.deepEqual(calls.slice(-2), ['release', 'uninitialize'])
  assert.equal(calls.includes('result'), false)
})
