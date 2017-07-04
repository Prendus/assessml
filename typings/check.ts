import {Variable} from './variable';
import {Content} from './content';

export interface Check {
    type: 'CHECK';
    varName: string;
    content: (Variable | Content)[];
}
