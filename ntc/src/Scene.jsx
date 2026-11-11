import {Canvas,useFrame,useThree} from '@react-three/fiber';
import {useMemo,useRef} from 'react';
const N=1500,RM=typeof matchMedia!=='undefined'&&matchMedia('(prefers-reduced-motion: reduce)').matches; // reduced motion: stars and capsule hold still
function Stars({speed,mode}){
  const geo=useRef(),mat=useRef(),d=useMemo(()=>({x:Array.from({length:N},()=>(Math.random()-.5)*120),y:Array.from({length:N},()=>(Math.random()-.5)*80),z:Array.from({length:N},()=>-Math.random()*200),pos:new Float32Array(N*6)}),[]);
  useFrame(()=>{const{x,y,z,pos}=d,s=speed.current;for(let i=0;i<N;i++){z[i]+=s;if(z[i]>5)z[i]=-200;const k=i*6;pos[k]=pos[k+3]=x[i];pos[k+1]=pos[k+4]=y[i];pos[k+2]=z[i];pos[k+5]=z[i]-s*6-.12}geo.current.attributes.position.needsUpdate=true;mat.current.opacity+=((mode==='results'?.28:mode==='warp'?1:.85)-mat.current.opacity)*.05}); // stars fade back while you browse results
  return <lineSegments><bufferGeometry ref={geo}><bufferAttribute attach="attributes-position" array={d.pos} count={N*2} itemSize={3}/></bufferGeometry><lineBasicMaterial ref={mat} color="#bcd4ff" transparent opacity={.85}/></lineSegments>;
}
function Capsule({mode,speed}){
  const g=useRef(),ring=useRef(),{size}=useThree(),metal=<meshStandardMaterial color="#b9c3d9" metalness={.85} roughness={.25}/>;
  useFrame(({pointer,clock})=>{const o=g.current,t=mode==='landing'?1:0,tgt=RM?0:mode==='warp'?5:mode==='results'?.04:.15;
    speed.current+=(tgt-speed.current)*.05;const s=o.scale.x+(t-o.scale.x)*.06;o.scale.setScalar(Math.max(s,.001));o.visible=s>.02;
    o.rotation.y+=RM?0:.006+speed.current*.01;o.rotation.x+=RM?0:(pointer.y*-.8-o.rotation.x)*.05;o.position.set(size.width>900?2.6:0,size.width>900?0:1.9,(1-s)*5);
    ring.current.material.emissiveIntensity=1.2+Math.sin(clock.elapsedTime*2.5)*.4});
  return <group ref={g} rotation-z={.5}>
    <mesh><cylinderGeometry args={[.9,.9,1.8,48]}/>{metal}</mesh>
    {[1,-1].map(s=><mesh key={s} position-y={s*.9}><sphereGeometry args={[.9,48,24]}/>{metal}</mesh>)}
    <mesh ref={ring} rotation-x={Math.PI/2}><torusGeometry args={[.93,.05,16,64]}/><meshStandardMaterial color="#7cf0ff" emissive="#7cf0ff"/></mesh>
    <mesh position={[0,.2,.82]}><sphereGeometry args={[.32,32,16]}/><meshStandardMaterial color="#7cf0ff" emissive="#3fd0ff" emissiveIntensity={1.4}/></mesh>
  </group>;
}
function Rig({children}){useFrame(({camera,pointer})=>{if(!RM)camera.position.x+=(pointer.x*1.2-camera.position.x)*.04;camera.lookAt(0,0,0)});return children}
export default function Scene({mode}){
  const speed=useRef(.15);
  return <Canvas className="bg" camera={{position:[0,0,6],fov:60}} dpr={[1,2]} gl={{alpha:true}}>
    <ambientLight intensity={.6}/><pointLight color="#7cf0ff" intensity={60} position={[4,3,5]}/><pointLight color="#ffb86b" intensity={40} position={[-4,-2,4]}/>
    <Rig><Stars speed={speed} mode={mode}/><Capsule mode={mode} speed={speed}/></Rig></Canvas>;
}
