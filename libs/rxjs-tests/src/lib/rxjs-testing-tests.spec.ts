import { TestScheduler } from 'rxjs/testing';
import { throttleTime } from 'rxjs/operators';

describe('rxjs/testing', () => {
  let testScheduler: TestScheduler;

  beforeEach(() => {
    testScheduler = new TestScheduler((actual, expected) => {
      expect(actual).toEqual(expected); // must be a deep equality check
    });
  });

  // This test will actually run *synchronously*
  it('generate the stream correctly', () => {
    testScheduler.run(helpers => {
      const { cold, expectObservable, expectSubscriptions } = helpers;
      const e1 = cold(' -a--b--c---|');
      const subs = '    ^----------!';
      const expected = '-a-----c---|';

      expectObservable(
        e1.pipe(throttleTime(3 /* NOT NEEDED ANYMORE:, testScheduler */))
      ).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(subs);
    });
  });

  it('late subscription (hot)', () => {
    testScheduler.run(helpers => {
      const { hot, expectObservable, expectSubscriptions } = helpers;
      const e1 = hot('  -a-b--c---|'); // starts emitting at test start
      const subs = '    ---^------!';
      const expected = '---b--c---';

      expectObservable(e1, subs).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(subs);
    });
  });

  it('late subscription (cold)', () => {
    testScheduler.run(helpers => {
      const { cold, expectObservable, expectSubscriptions } = helpers;
      const e1 = cold('    -a-b--c---|'); // starts emitting after subscription
      const subs = '    ---^------!';
      const expected = '----a-b--c---';

      expectObservable(e1, subs).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(subs);
    });
  });

  it('hot observable with subscription point', () => {
    testScheduler.run(helpers => {
      const { hot, expectObservable, expectSubscriptions } = helpers;
      const e1 = hot('  -a-^b--c---|');
      const expected = '   -b--c---|';

      expectObservable(e1).toBe(expected);
    });
  });
});
