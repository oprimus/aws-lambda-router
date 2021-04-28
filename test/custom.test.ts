import { process as custom, CustomEvent } from '../lib/custom'

describe('custom.processor', () => {
  const context = {} as any

  it('context should be passed through', () => {
    const actionSpy = jasmine.createSpy('action')

    const context = { bla: 'blup' } as any
    const customCfg = { routes: [{ matcher: () => true, action: actionSpy }] }
    const event = { 'detail-type': 'Custom Event' } as CustomEvent

    custom(customCfg, event, context)

    expect(actionSpy).toHaveBeenCalledWith(event, context)
  })

  it('should ignore event if it doesn\'t match a route', () => {
    const customCfg = { routes: [{ matcher: () => false, action: () => 1 }] }
    expect(custom(customCfg, {} as any, context)).toBe(null)
    // @ts-ignore
    expect(custom(customCfg, { 'detail-type': 'Not a custom event' } as CustomEvent, context)).toBe(null)
  })

  it('should action event if it matches a route', () => {
    const customCfg = { routes: [{ matcher: (event: any) => event['detail-type'] === 'A custom event', action: () => 'Success' }] }
    expect(custom(customCfg, { 'detail-type': 'Not a custom event' } as CustomEvent, context)).toBe(null)
    // @ts-ignore
    expect(custom(customCfg, { 'detail-type': 'A custom event' } as CustomEvent, context)).toBe('Success')
  })

  it('should fail on missing matcher', () => {
    const customCfg = { routes: [{}] } as any
    expect(() => custom(customCfg, { 'detail-type': 'Custom Event' } as CustomEvent, context)).toThrow()
  })

})
