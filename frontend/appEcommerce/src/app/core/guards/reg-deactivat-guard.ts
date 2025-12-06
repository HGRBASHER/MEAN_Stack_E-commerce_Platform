import { CanDeactivateFn } from '@angular/router';
export interface ICanComponentDeactivate {
  canDeactivate: () => boolean | Promise<boolean>;
}
export const regDeactivatGuard: CanDeactivateFn<ICanComponentDeactivate> = (component, currentRoute, currentState, nextState) => {
  return component.canDeactivate? component.canDeactivate() : true ;
};
