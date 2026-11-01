// ES Modules & Import system

import Logger, { add, subtract } from './utils/mathUtil';

const logger = new Logger();

logger.log(add(1, 2));
logger.log(subtract(5, 3));
