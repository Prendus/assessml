import {Variable} from './variable';
import {Content} from './content';

export interface Drag {
    type: 'DRAG';
    varName: string;
    content: (Variable | Content)[];
}
