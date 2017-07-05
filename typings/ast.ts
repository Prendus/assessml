import {Content} from './content';
import {Variable} from './variable';
import {Input} from './input';
import {Essay} from './essay';
import {Check} from './check';
import {Radio} from './radio';
import {Drag} from './drag';
import {Drop} from './drop';

export interface AST {
    type: 'AST';
    ast: (Content | Variable | Input | Essay | Check | Radio | Drag | Drop)[];
}
