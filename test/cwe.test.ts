import { process as cwe, CweEvent } from '../lib/cwe'

describe('cwe.processor', () => {
  const context = {} as any

  it('context should be passed through', () => {
    const actionSpy = jasmine.createSpy('action')

    const context = { bla: 'blup' } as any
    const cweCfg = { routes: [{ source: /.*/, action: actionSpy }] }
    const event = { 'detail-type': 'Scheduled Event' } as CweEvent

    cwe(cweCfg, event, context)

    expect(actionSpy).toHaveBeenCalledWith(event, context)
  })

  it('should ignore event if it is no CloudWatch Event event', () => {
    const cweCfg = { routes: [{ source: /.*/, action: () => 1 }] }
    expect(cwe(cweCfg, {} as any, context)).toBe(null)
    // @ts-ignore
    expect(cwe(cweCfg, { 'detail-type': 'Not a scheduled event' } as CweEvent, context)).toBe(null)
  })

  it('should match null source for ".*"', () => {
    const cweCfg = { routes: [{ source: /.*/, action: () => 'Success' }] }
    expect(cwe(cweCfg, { 'detail-type': 'Scheduled Event', source: null } as unknown as CweEvent, context)).toBe('Success')
  })

  it('should match empty subject for ".*"', () => {
    const cweCfg = { routes: [{ subject: /.*/, action: () => 'Success' }] } as any
    expect(cwe(cweCfg, { 'detail-type': 'Scheduled Event' } as CweEvent, context)).toBe('Success')
  })

  it('should match source for "/porter/"', () => {
    const cweCfg = { routes: [{ source: /porter/, action: () => 'Success' }] }
    expect(cwe(cweCfg, { 'detail-type': 'Scheduled Event', source: 'importer' } as CweEvent, context)).toBe('Success')
  })

  it('should call action with cwe-message', () => {
    const cweCfg = { routes: [{ source: /porter/, action: (event: any) => event }] }
    const event = { 'detail-type': 'Scheduled Event', source: 'importer' } as CweEvent

    expect(cwe(cweCfg, event, context)).toBe(event)
  })

  it('should call first action with matching subject', () => {
    const cweCfg = {
      routes: [
        { source: /^123$/, action: () => 1 },
        { source: /123/, action: () => 2 },
        { source: /1234/, action: () => 3 }
      ]
    }
    const event = { 'detail-type': 'Scheduled Event', source: '1234' } as CweEvent
    expect(cwe(cweCfg, event, context)).toBe(2)
  })

  it('should match complete source', () => {
    const cweCfg = { routes: [{ source: 'aws:123:importer', action: () => 1 }] }
    expect(cwe(cweCfg, { 'detail-type': 'Scheduled Event', source: 'aws:123:importer' } as CweEvent, context)).toBe(1)
  })

  it('should not throw error on missing source', () => {
    const cweCfg = { routes: [{ action: () => 1 }] } as any
    cwe(cweCfg, { 'detail-type': 'Scheduled Event' } as CweEvent, context)
  })

  it('should fail on missing action', () => {
    const cweCfg = { routes: [{ source: /.*/ }] } as any
    expect(() => cwe(cweCfg, { 'detail-type': 'Scheduled Event' } as CweEvent, context)).toThrow()
  })

})
