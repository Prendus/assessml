import {Variable} from './variable';
import {Content} from './content';

export interface Radio {
    type: 'RADIO';
    varName: string;
    content: (Variable | Content)[];
}
