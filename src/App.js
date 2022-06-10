import * as THREE from 'three'
import { useMemo } from 'react'
import { Canvas, applyProps } from '@react-three/fiber'
import { useGLTF, BakeShadows, Environment, ContactShadows, OrbitControls } from '@react-three/drei'
import { LayerMaterial, Base, Depth } from 'lamina'
import { FlakesTexture } from 'three-stdlib'

export default function App() {
  return (
    <Canvas shadows dpr={[1, 2]} camera={{ position: [-7.5, 0, -7.5], fov: 35 }}>
      <Lamborghini scale={0.015} />
      <spotLight position={[0, 15, 0]} angle={0.25} penumbra={1} castShadow intensity={6} shadow-bias={-0.0001} />
      <ambientLight intensity={0.2} />
      <ContactShadows resolution={2048} frames={1} position={[0, -1.16, 0]} scale={10} blur={0.75} opacity={1} far={10} />

      {/* We're building a cube-mapped environment declaratively.
          Anything you put in here will be filmed (once) by a cubemap-camera
          and applied to the scenes environment, and optionally background. */}
      <Environment background resolution={512}>
        {/* Ceiling */}
        <Striplight rotation-x={Math.PI / 2} position={[0, 4, -6]} scale={[10, 1, 1]} />
        <Striplight rotation-x={Math.PI / 2} position={[0, 4, -4]} scale={[10, 1, 1]} />
        <Striplight rotation-x={Math.PI / 2} position={[0, 4, -2]} scale={[10, 1, 1]} />
        <Striplight rotation-x={Math.PI / 2} position={[0, 4, 0]} scale={[10, 1, 1]} />
        <Striplight rotation-x={Math.PI / 2} position={[0, 4, 2]} scale={[10, 1, 1]} />
        <Striplight rotation-x={Math.PI / 2} position={[0, 4, 4]} scale={[10, 1, 1]} />
        <Striplight rotation-x={Math.PI / 2} position={[0, 4, 6]} scale={[10, 1, 1]} />
        {/* Sides */}
        <Striplight rotation-y={Math.PI / 2} position={[-10, 2, 0]} scale={[20, 1, 1]} />
        <Striplight rotation-y={-Math.PI / 2} position={[10, 2, 0]} scale={[20, 1, 1]} />
        {/* Key */}
        <Ringlight scale={2} position={[10, 5, 10]} onUpdate={(self) => self.lookAt(0, 0, 0)} />
        {/* Background */}
        <mesh scale={100}>
          <sphereGeometry args={[1, 64, 64]} />
          <LayerMaterial side={THREE.BackSide}>
            <Base color="#444" alpha={1} mode="normal" />
            <Depth colorA="hotpink" colorB="#447" alpha={0.5} mode="normal" near={0} far={300} origin={[100, 100, 100]} />
          </LayerMaterial>
        </mesh>
      </Environment>
      <BakeShadows />
      <OrbitControls enablePan={false} enableZoom={false} minPolarAngle={Math.PI / 2.4} maxPolarAngle={Math.PI / 2.4} />
    </Canvas>
  )
}

/*
Author: Steven Grey (https://sketchfab.com/Steven007)
License: CC-BY-NC-4.0 (http://creativecommons.org/licenses/by-nc/4.0/)
Source: https://sketchfab.com/3d-models/lamborghini-urus-2650599973b649ddb4460ff6c03e4aa2
Title: Lamborghini Urus
*/
function Lamborghini(props) {
  const { scene, nodes, materials } = useGLTF('/lambo.glb')

  useMemo(() => {
    Object.values(nodes).forEach((node) => {
      if (node.isMesh) {
        // Set up shadows
        node.receiveShadow = node.castShadow = true
        // Fix glas, normals look messed up in the original
        if (node.name.startsWith('glass')) node.geometry.computeVertexNormals()
        // Fix logo, too dark
        if (node.name === 'silver_001_BreakDiscs_0') node.material = applyProps(materials.BreakDiscs.clone(), { color: '#ddd' })
      }
    })
    // Fix windows, they have to be inset some more
    nodes['glass_003'].scale.setScalar(2.7)
    // Fix inner frame, too light
    applyProps(materials.FrameBlack, { metalness: 0.5, roughness: 1, color: 'black' })
    // Wheels, change color from chrome to black matte
    applyProps(materials.Chrome, { metalness: 1, roughness: 0.2, color: '#333' })
    applyProps(materials.BreakDiscs, { metalness: 0.2, roughness: 0.2, color: '#555' })
    applyProps(materials.TiresGum, { metalness: 0, color: '#333' })
    applyProps(materials.GreyElements, { metalness: 0, color: '#292929' })
    // Paint, from yellow to silver with paint chips
    applyProps(materials.WhiteCar, {
      roughness: 0.0,
      metalness: 0.15,
      color: '#555',
      envMapIntensity: 2,
      normalMap: new THREE.CanvasTexture(new FlakesTexture(), THREE.UVMapping, THREE.RepeatWrapping, THREE.RepeatWrapping),
      'normalMap-repeat': [40, 40],
      normalScale: [0.04, 0.04]
    })
  }, [nodes, materials])
  return <primitive object={scene} {...props} />
}

function Striplight(props) {
  return (
    <mesh {...props}>
      <planeGeometry />
      <meshBasicMaterial color="white" toneMapped={false} />
    </mesh>
  )
}

function Ringlight(props) {
  return (
    <mesh {...props}>
      <ringGeometry args={[1, 2, 64]} />
      <meshBasicMaterial color="white" toneMapped={false} />
    </mesh>
  )
}
