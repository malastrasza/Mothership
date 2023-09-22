import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'priorityError',
})
export class PriorityErrorPipe implements PipeTransform {
  transform(errors: any, priority: string[]): any {
    if (!errors) {
      return null;
    }

    const priorityErr: any = {};

    for (let err of priority) {
      if (errors[err]) {
        priorityErr[err] = errors[err];
        break;
      }
    }

    return priorityErr;
  }
}
