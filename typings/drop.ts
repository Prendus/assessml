import {Variable} from './variable';
import {Content} from './content';

export interface Drop {
    type: 'DROP';
    varName: string;
    content: (Variable | Content)[];
}
