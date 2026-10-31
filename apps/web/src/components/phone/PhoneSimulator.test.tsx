import {render,screen,fireEvent,cleanup} from '@testing-library/react';
import {afterEach,expect,it,vi} from 'vitest';
import {PhoneSimulator} from './PhoneSimulator';
import read from '../../mocks/read-hero.json';
afterEach(cleanup);
it('accepts only an answer from its own same-origin frame and matching token',()=>{const answer=vi.fn(),close=vi.fn();render(<PhoneSimulator token="demo" onAnswer={answer} onClose={close}/>);const frame=screen.getByTitle('Neighbour check') as HTMLIFrameElement;const data={type:'stacksense-check-complete',token:'demo',result:read};fireEvent(window,new MessageEvent('message',{origin:'https://example.invalid',source:frame.contentWindow,data}));expect(answer).not.toHaveBeenCalled();fireEvent(window,new MessageEvent('message',{origin:window.location.origin,source:frame.contentWindow,data}));expect(answer).toHaveBeenCalledOnce();expect(close).toHaveBeenCalledOnce();});
