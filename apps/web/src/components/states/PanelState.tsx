'use client';
import {Component,Suspense,type ReactNode} from 'react';
type Props={name:string;children:ReactNode};
export class PanelState extends Component<Props,{failed:boolean}>{
 state={failed:false};
 static getDerivedStateFromError(){return {failed:true};}
 render(){return this.state.failed?<section className="panel" role="alert"><h2>{this.props.name} unavailable</h2><p>This panel could not be displayed. Your recorded evidence has not changed.</p><button onClick={()=>this.setState({failed:false})}>Retry {this.props.name}</button></section>:<Suspense fallback={<section className="panel skeleton" role="status" aria-label={`Loading ${this.props.name.toLowerCase()}`}><span className="sr-only">Loading {this.props.name.toLowerCase()}…</span></section>}>{this.props.children}</Suspense>;}
}
