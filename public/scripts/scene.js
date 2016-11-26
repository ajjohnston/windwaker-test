let scene, camera, renderer, controls
let ocean, clock

init()
animate()

function init () {
  scene = new THREE.Scene()

  createCamera()

  clock = new THREE.Clock()

  // Create the ocean
  ocean = new Ocean()
  Promise.all([
    ocean.init()
  ]).then((meshes) => {
    meshes.map((x) => scene.add(x))
  })

  // Create the renderer
  renderer = new THREE.WebGLRenderer()
  renderer.setSize(window.innerWidth, window.innerHeight)

  document.body.appendChild(renderer.domElement)
}

function createCamera () {
  camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 10000)
  camera.position.set(95, 95, 35)
  camera.up = new THREE.Vector3(0, 0, 1)
  camera.lookAt(new THREE.Vector3(0, 0, 0))

  controls = new THREE.OrbitControls(camera, renderer)
}

function animate () {
  requestAnimationFrame(animate)
  render()
  update()
}

function update () {
  controls.update()
}

function render () {
  ocean.update()
  renderer.render(scene, camera)
}
