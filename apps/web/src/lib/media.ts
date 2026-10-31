type PhotoMedia={url:string;demo:boolean};
const preparedPhotos=new Map<string,PhotoMedia>();
const demoIds=new Set(['P402','P202','P302','P502']);
export function rememberPhoto(id:string,url:string){
 if(!/^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/.test(url)||url.length>12*1024*1024)return false;
 preparedPhotos.set(id,{url,demo:false});
 if(preparedPhotos.size>50)preparedPhotos.delete(preparedPhotos.keys().next().value!);
 return true;
}
export function photoMedia(id:string):PhotoMedia|null{return preparedPhotos.get(id)??(demoIds.has(id)?{url:'/demo/evidence.svg',demo:true}:null);}
export function clearPhotoMedia(){preparedPhotos.clear();}
