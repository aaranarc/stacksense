import assets from '../../public/demo/photos/assets.json';
type PhotoMedia={url:string;demo:boolean;illustration:boolean;label:string};
type Asset={path:string;assetSource:string;label:string};
const preparedPhotos=new Map<string,PhotoMedia>();
const demoIds=new Set(['P402','P202','P302','P502']);
const approved=new Map<string,PhotoMedia>();
const entry=(asset:Asset):PhotoMedia=>({url:`/demo/photos/${asset.path.split('/').at(-1)}`,demo:true,illustration:asset.assetSource==='demo-illustration',label:asset.label});
for(const [id,asset] of Object.entries(assets.hero))approved.set(id,entry(asset));
for(const asset of assets.meters)approved.set(asset.id,entry(asset));
for(const asset of Object.values(assets.scenarios))approved.set(asset.id,entry(asset));
export function rememberPhoto(id:string,url:string){
 if(!/^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/.test(url)||url.length>12*1024*1024)return false;
 preparedPhotos.set(id,{url,demo:false,illustration:false,label:'Prepared photo · local preview'});
 if(preparedPhotos.size>50)preparedPhotos.delete(preparedPhotos.keys().next().value!);
 return true;
}
export function photoMedia(id:string):PhotoMedia|null{return preparedPhotos.get(id)??approved.get(id)??(demoIds.has(id)?{url:'/demo/evidence.svg',demo:true,illustration:true,label:'Demo illustration, not a real photo'}:null);}
export function clearPhotoMedia(){preparedPhotos.clear();}
