const TEXTURE_PATH = './resources/ocean_tile.png'
const TEXTURE_REPEAT = 8

class Ocean { // eslint-disable-line no-unused-vars
  constructor () {
    this.ready = false
    this.step = 0
  }

  init () {
    return new Promise((resolve) => {
      const loader = new THREE.TextureLoader()

      loader.load(TEXTURE_PATH, (texture) => {
        texture.wrapS = texture.wrapT = THREE.RepeatWrapping

        this.geometry = new THREE.PlaneGeometry(256, 256, 256)

        this.uniforms = {
          time: { type: 'f', value: 0 },
          textRepeat: { type: 'f', value: TEXTURE_REPEAT },
          tFoam: { type: 't', value: texture },
          tWater: { type: 't', value: new THREE.MeshBasicMaterial({ color: 0xff0000 }) }
        }

        this.material = new THREE.ShaderMaterial({
          uniforms: this.uniforms,
          vertexShader: VERTEX_SHADER,
          fragmentShader: FRAGMENT_SHADER,
          transparent: true
        })

        this.mesh = new THREE.Mesh(this.geometry, this.material)

        this.ready = true

        resolve(this.mesh)
      })
    })
  }

  update () {
    if (!this.ready) return

    this.uniforms.time.value += clock.getDelta() * 0.23
  }
}

const VERTEX_SHADER = `
  varying vec2 vUv;
  uniform float time;

  float pi = 3.14159;

  void main()
  {
    vUv = uv;
    vec3 newPosition = position + normal;

    float x = position.x + time;
    float y = position.y + time;

    newPosition.z = 0.0;
    newPosition.z += sin(6.2 * (position.x + time)) * 3.0;
    newPosition.z += sin(4.3 * (position.y + time)) * 2.0;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
  }`

const FRAGMENT_SHADER = `
  #ifdef GL_ES
  precision highp float;
  #endif

  float pi = 3.14159;

  varying vec2 vUv;

  uniform float time;
  uniform float textRepeat;
  uniform sampler2D tFoam;
  uniform sampler2D tFoam2;

  vec2 SineWave(vec2 p, float amplifier);
  float SineWaveX(vec2 p, float amplifier);
  float SineWaveY(vec2 p, float amplifier);

  vec2 SineWave(vec2 p, float amplifier){
    float x = SineWaveX(p, amplifier);
    float y = SineWaveY(p, amplifier);
    return vec2(x, y);
  }

  float SineWaveX(vec2 p, float amplifier) {
    float a1 = 0.015;
    float w1 = 1.2 * pi;
    float t1 = 15.8;

    float a2 = 0.037;
    float w2 = 3.6 * pi;
    float t2 = 67.6;

    float a3 = 0.022;
    float w3 = 0.6 * pi;
    float t3 = 13.6;

    float a4 = 0.021;
    float w4 = 2.9 * pi;
    float t4 = 0.93;

    float x = 0.0;

    float localTime = time * 1.7;

    x += sin(w1 * p.y + t1 + localTime) * a1;
    x += sin(w2 * p.y + t2 + localTime) * a2;
    x += sin(w3 * p.y + t3 + localTime) * a3;
    x += sin(w4 * p.y + t4 + localTime) * a4;

    return p.x + x * 0.35 * amplifier;
  }

  float SineWaveY(vec2 p, float amplifier) {
    float a1 = 0.015;
    float w1 = 2.2 * pi;
    float t1 = 5.52;

    float a2 = 0.051;
    float w2 = 6.9 * pi;
    float t2 = 0.93;

    float a3 = 0.0187;
    float w3 = 4.6 * pi;
    float t3 = 8.94;

    float a4 = 0.011;
    float w4 = 1.7 * pi;
    float t4 = 35.8;

    float y = 0.0;

    float localTime = time * 1.3;

    y += sin(w1 * p.x + t1 + localTime) * a1;
    y += sin(w2 * p.x + t2 + localTime) * a2;
    y += sin(w3 * p.x + t3 + localTime) * a3;
    y += sin(w4 * p.x + t4 + localTime) * a4;

    return p.y + y * 0.23 * amplifier;
  }

  void main(void)
  {
      vec3 c;
      vec4 Ca = texture2D(tFoam, SineWave(vUv, 2.3) * textRepeat);
      Ca.a *= 0.67;

      vec4 Cb = texture2D(tFoam, SineWave(vUv, 0.4) / 0.2);

      vec3 Cc = vec3(0.0, 0.44, 0.75);

      c = Cc;
      c += Ca.rgb * Ca.a;

      if (Ca.a < 1.0 && Cb.a < 0.5) c += vec3(0.0, 0.41, 0.73) * 0.05;

      gl_FragColor = vec4(c, 1.0);
  }`
