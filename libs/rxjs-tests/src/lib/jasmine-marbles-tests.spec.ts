import { cold, time, getTestScheduler, hot } from 'jasmine-marbles';
import { of, from, timer, interval } from 'rxjs';
import { take, catchError, map, delay } from 'rxjs/operators';

describe('jest-marbles tests', () => {
  describe('of', () => {
    it('should emit single value and immediately complete', () => {
      expect(of([1, 2, 3])).toBeObservable(cold('(a|)', { a: [1, 2, 3] }));
    });
  });

  describe('from', () => {
    it('should emit all items of array and immediately complete', () => {
      expect(from(['a', 'b', 'c'])).toBeObservable(cold('(abc|)'));
    });
  });

  describe('timer', () => {
    it('should emit after a given time and immediately complete', () => {
      expect(timer(30, getTestScheduler())).toBeObservable(
        cold('---(x|)', { x: 0 })
      );
    });

    it('using TestScheduler.run() should emit after a given time and immediately complete', () => {
      getTestScheduler().run(() =>
        expect(timer(time('---|'))).toBeObservable(cold('---(x|)', { x: 0 }))
      );
    });

    it('should emit periodically after a given delay and complete after 3 emits', () => {
      expect(
        timer(time('---|'), time('-|'), getTestScheduler()).pipe(
          take(3),
          map(x => String(x))
        )
      ).toBeObservable(cold('---01(2|)'));
    });

    it('should emit periodically (use manual subscription)', () => {
      getTestScheduler().run(({ expectObservable }) => {
        const observable = timer(2000, 1000).pipe(map(x => String(x)));
        const subscribeFor5Seconds = '^ 5s !';
        expectObservable(observable, subscribeFor5Seconds).toBe(
          '2s 0 0.999s 1 0.999s 2 0.999s 3' // NOTE: emitting the value takes 1ms, hence 0.999s breaks instead of 1s!
        );
      });
    });
  });

  describe('interval', () => {
    it('should emit periodically (use manual subscription)', () => {
      getTestScheduler().run(({ expectObservable }) => {
        const observable = interval(2).pipe(map(x => String(x)));
        const subscription = '^--------!';
        const expected = '    --0-1-2-3';
        expectObservable(observable, subscription).toBe(expected);
      });
    });
  });

  describe('hot vs. cold', () => {
    it('should start emitting at subscribe when cold', () => {
      getTestScheduler().run(({ expectObservable }) => {
        const observable = cold('0-1-2-3-4-5-6-7-8-9');
        const subscription = '   --^------!';
        const expected = '       --0-1-2-3';
        expectObservable(observable, subscription).toBe(expected);
      });
    });

    it('should start emitting immediately when hot', () => {
      getTestScheduler().run(({ expectObservable }) => {
        const observable = hot(' 0-1-2-3-4-5-6-7-8-9');
        const subscription = '   --^------!';
        const expected = '       --1-2-3-4';
        expectObservable(observable, subscription).toBe(expected);
      });
    });

    it('should start subscribe at specific point in time when using hot subscription point', () => {
      getTestScheduler().run(({ expectObservable }) => {
        const observable = hot(' 0-1-2-3-4-5-^6-7-8-9');
        const expected = '                   -6-7-8-9';
        expectObservable(observable).toBe(expected);
      });
    });
  });

  describe('catchError', () => {
    it('should emit error message and complete', () => {
      expect(
        cold('--x#|', { x: '1' }, new Error('2')).pipe(
          catchError(e => of(e.message))
        )
      ).toBeObservable(cold('--1(2|)'));
    });
  });

  describe('delay', () => {
    it('should emit after given delay', () => {
      const actual = cold('  --1-2---------1---|').pipe(
        delay(20, getTestScheduler())
      );
      const expected = cold('----1-2---------1---|'); // outside getTestScheduler().run() one frame == 10ms
      expect(actual).toBeObservable(expected);
    });

    it('should emit after given delay (inside TestScheduler.run())', () => {
      getTestScheduler().run(() => {
        const actual = cold('   --1-2---------1---|').pipe(delay(20));
        const expected = cold('----------------------1-2---------1---|'); // inside getTestScheduler().run() one frame == 1ms
        expect(actual).toBeObservable(expected);
      });
    });

    it(
      'should emit after given delay (using time progression syntax)',
      testSchedule(() => {
        const actual = cold('  --1-2---------1---|').pipe(delay(20));
        const expected = cold('-- 20ms 1-2---------1---|');
        expect(actual).toBeObservable(expected);
      })
    );
  });
});

function testSchedule(func: () => unknown) {
  return () => getTestScheduler().run(func);
}
