import { cold, time, Scheduler } from 'jest-marbles';
import { of, from, timer } from 'rxjs';
import { take, catchError, delay } from 'rxjs/operators';

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
      expect(timer(time('---|'), Scheduler.get())).toBeObservable(
        cold('---(0|)')
      );
    });

    it('using TestScheduler.run() should emit after a given time and immediately complete', () => {
      Scheduler.get().run(() =>
        expect(timer(time('---|'))).toBeObservable(cold('---(0|)'))
      );
    });

    it('should emit periodically after a given delay and complete after 3 emits', () => {
      expect(
        timer(time('---|'), time('-|'), Scheduler.get()).pipe(take(3))
      ).toBeObservable(cold('---01(2|)'));
    });
  });

  describe('catchError', () => {
    it('should emit error message and complete', () => {
      expect(
        cold('--x#|', { x: 1 }, new Error('2')).pipe(
          catchError(e => of(e.message))
        )
      ).toBeMarble('--1(2|)');
    });
  });
});
