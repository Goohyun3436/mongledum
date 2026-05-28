/**
 * Ripples3
 * Nico Pr
 * https://nicopr.fr/ripples3
 * https://github.com/nicopowa/ripples3
 */

const handleError = err => {

	console.error(err);

	const errorDiv = document.createElement("div");

	errorDiv.classList.add("err");
	errorDiv.innerHTML = "<div>liquify fail</div>" + "<br/>" + err;
	document.body.appendChild(errorDiv);

};

const lazy = (cb, ms = 256) =>
	setTimeout(
		cb,
		ms + Math.round(Math.random() * ms)
	);

const getCustomizer = () =>
	window.MONGLEDUM_RIPPLES_CUSTOMIZER || {};

const HASH_PARAM_MAP = {
	wsp: "waveSpeed",
	dmp: "damping",
	pgs: "propagationSpeed",
	rft: "refraction",
	wth: "waterHue",
	tnt: "tintStrength",
	sps: "specularStrength",
	rgs: "roughness",
	fre: "fresnelEffect",
	frp: "fresnelPower",
	frr: "reflectionFresnel",
	blr: "reflectionBlur",
	dst: "reflectionDistortion",
	skh: "skyHue",
	dpt: "depthFactor",
	sct: "atmosphericScatter",
	env: "envMapIntensity",
	trd: "touchRadius",
	tmp: "initialImpact",
	ttr: "trailStrength",
	tsp: "trailSpread",
	css: "causticStrength",
	csc: "causticScale",
	csp: "causticSpeed",
	csb: "causticBrightness",
	csd: "causticDetail",
	sun: "sunIntensity",
	snh: "sunHue",
	sth: "sunAngle",
	sph: "sunHeight",
	lht: "lightIntensity",
	lih: "lightHue",
	lth: "lightAngle",
	lph: "lightHeight",
	rfs: "waveReflectionStrength",
	rfm: "mirrorReflectionStrength",
	rfv: "velocityReflectionFactor"
};

class StaticControls {

	constructor(liquid) {

		this.liquid = liquid;
		this.pop = false;
		this.bnd = { x: 0, y: 0, w: 0, h: 0 };

	}

	hashParams() {

		const hash = window.location.hash.slice(1);

		if(!hash.length)
			return {};

		try {

			const params = {};

			hash.split("&")
			.map(entry => entry.split("="))
			.forEach(([key, rawValue]) => {

				if(key === "img") {
					params.img = rawValue;
					return;
				}

				const paramKey = HASH_PARAM_MAP[key];

				if(!paramKey)
					return;

				params[paramKey] = JSON.parse(rawValue);

			});

			return params;
		
		}
		catch(err) {

			this.liquid.renderText("bad url");
			console.error(err);
			return {};
		
		}
	
	}

	hueToRGB(hue) {

		hue = hue % 1;

		if(hue < 0)
			hue += 1;

		const h = hue * 6;
		const i = Math.floor(h);
		const f = h - i;
		const p = 0;
		const q = 1 - f;
		const t = f;

		switch(i % 6) {
			case 0: return [1, t, p];
			case 1: return [q, 1, p];
			case 2: return [p, 1, t];
			case 3: return [p, q, 1];
			case 4: return [t, p, 1];
			case 5: return [1, p, q];
			default: return [0, 0, 0];
		}
	
	}

	degToRad(deg) {

		return deg * Math.PI / 180;
	
	}

	sphericalToCartesian(angleDeg, heightDeg) {

		const theta = this.degToRad(angleDeg);
		const phi = this.degToRad(90 - heightDeg);
		const sinPhi = Math.sin(phi);
		const x = sinPhi * Math.cos(theta);
		const y = sinPhi * Math.sin(theta);
		const z = Math.cos(phi);
		const len = Math.sqrt(x * x + y * y + z * z);

		return [x / len, y / len, z / len];
	
	}

	updateSunLight() {

		this.liquid.params.sunDirection = this.sphericalToCartesian(
			this.liquid.params.sunAngle,
			this.liquid.params.sunHeight
		);
		this.liquid.params.lightDirection = this.sphericalToCartesian(
			this.liquid.params.lightAngle,
			this.liquid.params.lightHeight
		);
		this.liquid.params.sunColor = this.hueToRGB(this.liquid.params.sunHue);
		this.liquid.params.lightColor = this.hueToRGB(this.liquid.params.lightHue);
	
	}

	updateColors() {

		this.liquid.params.waterColor = this.hueToRGB(this.liquid.params.waterHue);
		this.liquid.params.skyColor = this.hueToRGB(this.liquid.params.skyHue);
	
	}

	updateBounds() {}
	mask() {}
	toggle() {}
	liquified() {}

}

window.addEventListener(
	"load",
	() => {

		window.addEventListener(
			"error",
			evt => {

				handleError(evt.error);

				return false;
	
			}
		);

		window.addEventListener(
			"unhandledrejection",
			evt => {

				handleError(evt.reason);

				return false;
	
			}
		);

		try {

			const rippler = document.querySelector("#ripples3");

			const liquify = new Liquid(rippler);
			const amplify = new StaticControls(liquify);

			liquify
			.flow(
				amplify,
				amplify.hashParams()
			)
			.then(() => {

				if(DEBUG)
					console.log("flowing");

				lazy(
					() => {
						// liquify.snailIt();
						// liquify.circleIt();
						// if(!liquify.isTouched) liquify.dropIt();
						/*lazy(
							() => {
								if(!liquify.isTouched) liquify.curveIt();
							}, 
							1000
						);*/
					},
					500
				);
			
			})
			.catch(err =>
				handleError(err));
	
		}
		catch(err) {

			handleError(err);
	
		}

	}
);

class Liquid {

	/**
	 * @param {Element} wrap 
	 */
	constructor(wrap = document.body) {

		this.BASE_SCALE = 2.0;
		this.REF_SIZE = 1024;
		this.MAX_SCALE = 2.0;
		this.MIN_SCALE = 1.0;
		this.STEP = 1000 / 60;
		this.DISP_SCALE = this.MAX_SCALE;
		this.PAUSE_HIDE = true;
		this.PAUSE_BLUR = false;
		this.TARGET_FPS = 50;
		this.FRAME_SIZE = 32;
		this.SCALE_TIME = 1000;
		this.SCALE_STEP = 0.5;
		this.ENABLE_UPSCALE = true;
		this.LOOPS_TO_SCALE = 3;

		this.MAX_TOUCHES = 10;

		this.PERF_CHECK = false;
		this.LOOP_COUNT = 0;
		this.DOWN_FROM = this.MAX_SCALE;
		this.ww = 0;
		this.wh = 0;
		this.sizeBase = 0;
		this.wrap = wrap;

		this.syncSize();

		this.params = presets["default"];

		this.amplify
		= this.hitting
		= this.sizing
		= this.img
		= this.image
		= this.cvs
		= this.gl
		= this.vertexBuffer
		= this.physicsProgram
		= this.physics
		= this.renderProgram
		= this.renders
		= this.currentTexture
		= this.previousTexture
		= this.backgroundTexture
		= this.waterTexture1
		= this.waterTexture2
		= this.currentFramebuffer
		= this.framebuffer1
		= this.framebuffer2
		= null;

		this.loop = -1;
		this.hits = false;

		this.vertices = new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]);

		// touches x,y,px,py
		this.touchPositions = new Float32Array(this.MAX_TOUCHES * 4);

		this.scaledPropagation = this.params.propagationSpeed;

		this.currentFPS = 0;
		this.frameTimeHistory = [];
		this.frameTimeSum = 0;
		this.frameTimeIndex = 0;
		this.lastFrameTime = 0;
		this.lastScaleCheck = 0;
		this.notBefore = 0;

		this.isLiquid = false;
		this.isRunning = false;
		this.isVisible = true;
		this.isFocused = true;
		this.isTouched = false;
		this.isAuto = false;
		this.isTest = false;
		this.testLoop = null;
		this.isRaining = false;
		this.lastRainDrop = 0;
		this.rainDropDelay = 384;
		this.maxRaindrops = 4;
		this.activeRaindrops = null;

		this.pops = new Map();
		this.deltaTime = 1;
		this.accumulatedTime = 0;
		this.infos = null;

		this.dirtyPhysics = true;
		this.dirtyRenders = true;

		this.bck = document.createElement("canvas");
		this.btx = this.bck.getContext(
			"2d",
			{
				alpha: false
			}
		);

		this.cvs = document.createElement("canvas");
		this.cvs.style.opacity = "0";
		wrap.appendChild(this.cvs);
	
	}

	async load(preset) {

		if(DEBUG)
			console.log(
				"load preset",
				preset
			);
				
		this.renderText("loading");

		await this.fadeCanvas(0);

		// this.stopPerfCheck();
		this.stopRender();
		this.resetWater();

		if(preset.img && preset.img != this.img) {

			if(DEBUG)
				console.log("change background");
			
			this.img = preset.img;
			await this.loadBackground();
			this.updateBackgroundTexture();
		
		}

		this.params = {
			...presets["default"],
			...this.params,
			...preset
		};

		if(getCustomizer().backgroundImage)
			this.params.img = getCustomizer().backgroundImage;

		this.syncUniforms();

		this.amplify.updateSunLight();
		this.amplify.updateColors();

		this.startRender();
		
		await this.fadeCanvas(1);
	
	}

	flow(amplify = null, params = {}) {

		this.amplify = amplify;

		this.params = {
			...this.params,
			...params
		};

		if(getCustomizer().backgroundImage)
			this.params.img = getCustomizer().backgroundImage;

		this.img = this.params.img;

		this.infos = document.querySelector("#fps");

		if(DEBUG)
			console.log("flow");

		return [
			this.loadBackground,
			this.initializeWebGL,
			DEBUG ? this.initShaders : this.initShadersZip,
			this.initUniforms,
			this.initBuffers,
			this.syncCanvas,
			this.syncViewport,
			this.initTextures,
			this.syncTextures,
			this.syncUniforms,
			this.setupEvents,
			this.startRender
		]
		.map(fn =>
			fn.bind(this))
		.reduce(
			(prv, cur) =>
				prv.then(() =>
					cur()),
			Promise.resolve()
		)
		.then(() => {

			return this.fadeCanvas(1)
			.then(() => {

				if(DEBUG)
					console.log("liquified");

				this.isLiquid = true;
				this.amplify.liquified();
			
			});
		
		})
		.catch(err => {

			throw err;
		
		});
	
	}

	async loadBackground() {

		if(DEBUG)
			console.log(
				"load background",
				this.img
			);

		const imgUrl = (!this.img.startsWith("blob:") ? "assets/" : "") + this.img;

		this.image = await this.loadImage(imgUrl);
	
	}

	loadImage(imgSrc) {

		return new Promise(imgLoaded => {

			const i = new Image();

			i.addEventListener(
				"load",
				() =>
					imgLoaded(i)
			);
			i.addEventListener(
				"error",
				() => {

					throw new Error("image load error " + imgSrc);
			
				}
			);
			i.crossOrigin = "anonymous";
			i.src = imgSrc;
		
		});
	
	}

	initializeWebGL() {

		if(DEBUG)
			console.log("init webgl");

		const contextOptions = {
			alpha: false,
			antialias: false,
			depth: false,
			stencil: false,
			powerPreference: "high-performance",
			preserveDrawingBuffer: false
		};

		this.gl = this.cvs.getContext(
			"webgl2",
			contextOptions
		);

		if(!this.gl)
			throw new Error("webgl2 not supported");

		const ext = this.gl.getExtension("EXT_color_buffer_float");

		if(!ext)
			throw new Error("ext_color_buffer_float not supported");

		this.gl.getExtension("OES_texture_float_linear");

		const glInitErr = this.gl.getError();

		if(glInitErr !== this.gl.NO_ERROR) {

			throw new Error("webgl init error " + glInitErr);
		
		}
	
	}

	async initShaders() {

		if(DEBUG)
			console.log("init shaders");

		const VERTEX_SHADER = `#version 300 es
in vec2 position;
out vec2 texCoord;

void main() {
	texCoord = position * 0.5 + 0.5;
	gl_Position = vec4(position, 0.0, 1.0);
}`;

		const PHYSICS_SHADER = `#version 300 es
precision highp float;
precision highp sampler2D;

uniform vec2 uResolution;
uniform float uDeltaTime;
uniform float uDisplayScale;
uniform float uSizeBase;
uniform float uWaveSpeed;
uniform float uDamping;
uniform float uPropagationSpeed;

uniform sampler2D uPreviousState;
uniform vec2 uTouch[10];
uniform int uTouchCount;

struct Touch {
	vec2 position;
	float radius;
	float strength;
	float trail;
	float spread;
};

uniform Touch uTouchParams[10];
in vec2 texCoord;
out vec4 fragColor;

float getTouchDistance(vec2 texCoord, vec2 touchPos) {
	vec2 pixelCoord = texCoord * uResolution;
	float whatSize = max(uResolution.x, uResolution.y) / uSizeBase;
	vec2 delta = (pixelCoord - touchPos) / whatSize;
	return length(delta);
}

float getTrailEffect(vec2 texCoord, vec2 currentPos, vec2 prevPos, float spread, float whatSize) {
	vec2 moveVec = currentPos - prevPos;
	float moveLen = length(moveVec);
	
	if(moveLen < 0.0001) return 0.0;
	
	moveLen /= whatSize;
	vec2 moveDir = moveVec / moveLen;
	vec2 toPoint = (texCoord * uResolution - prevPos);
	float alongTrail = dot(toPoint, moveDir);
	
	if(alongTrail >= 0.0) return 0.0;
	
	vec2 perpToTrail = toPoint - (alongTrail * moveDir);
	float perpDist = length(perpToTrail) / whatSize;
	
	float trailStrength = max(0.0, 1.0 - perpDist / spread);
	return trailStrength * moveLen * 0.4;
}

void main() {
	vec2 pixel = vec2(1.0) / uResolution;
	vec4 state = texture(uPreviousState, texCoord);
	float height = state.r;
	float oldHeight = state.g;
	
	float sum = 0.0;
	
	for(int i = 0; i < 12; i++) {
		float angle = float(i) * 0.523598775;
		vec2 dir = vec2(cos(angle), sin(angle));
		vec2 sampleCoord = texCoord + dir * pixel * uPropagationSpeed;
		sampleCoord = clamp(sampleCoord, vec2(0.0), vec2(1.0));
		sum += texture(uPreviousState, sampleCoord).r;
	}
	
	sum /= 12.0;
	
	float newHeight = sum * 2.0 - oldHeight;
	newHeight = mix(height, newHeight, uWaveSpeed);
	newHeight *= uDamping;
	
	float whatSize = max(uResolution.x, uResolution.y);
	float totalEffect = 0.0;
	
	for(int i = 0; i < uTouchCount; i++) {
		float dist = getTouchDistance(texCoord, uTouch[i]);
		float scaledRadius = uTouchParams[i].radius;
		
		if(dist < scaledRadius) {
			float strength = smoothstep(scaledRadius, 0.0, dist);
			strength = pow(strength, 1.5);
			float touchEffect = uTouchParams[i].strength * strength * 0.6;
			
			if(uTouchParams[i].trail > 0.0 && i > 0) {
				touchEffect += uTouchParams[i].trail * getTrailEffect(texCoord, uTouch[i], uTouch[i-1], uTouchParams[i].spread, whatSize);
			}
			
			totalEffect += touchEffect;
		}
	}
	
	newHeight += totalEffect;
	
	fragColor = vec4(newHeight, height, 0.0, 1.0);
}`;

		const RENDER_SHADER = `#version 300 es
precision highp float;
precision highp sampler2D;

uniform vec2 uResolution;
uniform float uTime;
uniform float uDisplayScale;
uniform sampler2D uWaterHeight;
uniform sampler2D uBackgroundTexture;
uniform sampler2D uPreviousState;
uniform vec3 uSunDirection;
uniform vec3 uLightDirection;
uniform float uSunIntensity;
uniform float uLightIntensity;
uniform vec3 uSunColor;
uniform vec3 uLightColor;
uniform vec3 uWaterColor;
uniform float uTintStrength;
uniform float uSpecularStrength;
uniform float uRoughness;
uniform float uFresnelEffect;
uniform float uFresnelPower;
uniform float uSpecularPower;
uniform float uReflectionFresnel;
uniform float uReflectionDistortion;
uniform vec3 uSkyColor;
uniform float uDepthFactor;
uniform float uAtmosphericScatter;
uniform float uEnvMapIntensity;
uniform float uCausticStrength;
uniform float uCausticScale;
uniform float uCausticSpeed;
uniform float uCausticBrightness;
uniform float uCausticDetail;
uniform float uWaveReflectionStrength;
uniform float uMirrorReflectionStrength;
uniform float uVelocityReflectionFactor;
uniform float uReflectionBlur;
uniform float uRefraction;

in vec2 texCoord;
out vec4 fragColor;

vec3 getNormal(vec2 uv, vec2 pixel, out float velocity) {
	vec4 data = texture(uWaterHeight, uv);
	float height = data.r;
	float oldHeight = data.g;
	velocity = (height - oldHeight) * uDisplayScale;
	
	vec2 offset = pixel * 2.0;
	float l = texture(uWaterHeight, uv - vec2(offset.x, 0.0)).r;
	float r = texture(uWaterHeight, uv + vec2(offset.x, 0.0)).r;
	float t = texture(uWaterHeight, uv - vec2(0.0, offset.y)).r;
	float b = texture(uWaterHeight, uv + vec2(0.0, offset.y)).r;
	
	vec2 grad = vec2(r - l, b - t) * 0.5;
	
	float normalStrength = 1.0 + abs(velocity) * 2.0;
	grad *= normalStrength * uDisplayScale;
	
	return normalize(vec3(grad, 1.0));
}

float getCaustics(vec2 uv, vec3 normal, float velocity) {
	if(uCausticStrength <= 0.0) return 0.0;
	
	float scaledTime = uTime * uCausticSpeed;
	
	float scale = uCausticScale;
	vec2 causticsUV = uv * scale + normal.xy * uReflectionDistortion;
	float timeOffset = scaledTime;
	
	vec2 warp = vec2(
		sin(causticsUV.y * 2.0 + timeOffset),
		sin(causticsUV.x * 2.0 + timeOffset * 1.3)
	) * 0.1;
	
	causticsUV += warp;
	
	float detail = uCausticDetail * 8.0;
	float pattern = sin(causticsUV.x * detail + timeOffset) * 
				   sin(causticsUV.y * detail + timeOffset * 1.3);
	
	return pattern * 0.5 + 0.5;
}

float getReflection(vec3 normal, vec3 lightDir, vec3 viewDir, float velocity) {
	vec3 halfDir = normalize(lightDir + viewDir);
	float NdotH = max(dot(normal, halfDir), 0.0);
	float NdotL = max(dot(normal, lightDir), 0.0);
	
	float alpha = uRoughness * uRoughness;
	float alpha2 = alpha * alpha;
	float NdotH2 = NdotH * NdotH;
	
	float denom = NdotH2 * (alpha2 - 1.0) + 1.0;
	float D = alpha2 / (3.14159265359 * denom * denom);
	
	float mirrorSpec = D * uMirrorReflectionStrength;
	float waveSpec = pow(NdotH, uSpecularPower) * (1.0 + abs(velocity) * 10.0) * uWaveReflectionStrength;
	
	float velocityFactor = smoothstep(0.0, 1.0, abs(velocity) * uVelocityReflectionFactor * 1.2);
	return mix(mirrorSpec, waveSpec, velocityFactor) * uSpecularStrength * NdotL;
}

vec3 sampleBlurredBackground(vec2 uv, float radius, vec2 pixel) {
	if(radius <= 0.001) return texture(uBackgroundTexture, uv).rgb;
	
	const int samples = 5;
	vec2 offsets[samples] = vec2[](
		vec2(0.0, 0.0),
		vec2(1.0, 0.0), vec2(-1.0, 0.0), 
		vec2(0.0, 1.0), vec2(0.0, -1.0)
	);
	
	float weights[samples] = float[](
		0.5, 0.125, 0.125, 0.125, 0.125
	);
	
	vec3 color = vec3(0.0);
	for(int i = 0; i < samples; i++) {
		vec2 sampleUv = clamp(uv + offsets[i] * radius * pixel, 0.0, 1.0);
		color += texture(uBackgroundTexture, sampleUv).rgb * weights[i];
	}
	
	return color;
}

void main() {
	vec2 pixel = 1.0 / uResolution;
	vec3 viewDir = vec3(0.0, 0.0, 1.0);
	
	float velocity;
	vec3 normal = getNormal(texCoord, pixel, velocity);
	
	vec4 heightData = texture(uWaterHeight, texCoord);
	float height = heightData.r;
	float depth = clamp(height * uDepthFactor, 0.0, 1.0);
	
	float distortionFactor = min(abs(velocity) * 2.0, 1.0);
	vec2 refractOffset = normal.xy * uRefraction;
	vec2 bgCoord = clamp(texCoord + refractOffset, 0.0, 1.0);
	
	float viewAngle = 1.0 - max(dot(normal, viewDir), 0.0);
	
	float blurRadius = uReflectionBlur * (1.0 + distortionFactor);
	vec3 refractColor = sampleBlurredBackground(bgCoord, blurRadius, pixel);
	
	float waterDepth = smoothstep(0.0, 1.0, depth);
	float scatter = clamp(waterDepth * uAtmosphericScatter, 0.0, 1.0);
	
	vec3 deepWaterColor = mix(uWaterColor, uSkyColor * 0.3, scatter);
	vec3 waterColor = mix(refractColor, deepWaterColor, waterDepth * uTintStrength * 1.2);
	
	float fresnel = pow(viewAngle, max(uFresnelPower, 1.0)) * uFresnelEffect * 1.2;
	float reflectionStrength = smoothstep(0.0, 1.0, fresnel);
	
	vec3 sunDir = normalize(uSunDirection);
	vec3 lightDir = normalize(uLightDirection);
	
	float sunSpecular = getReflection(normal, sunDir, viewDir, velocity);
	float lightSpecular = getReflection(normal, lightDir, viewDir, velocity);
	
	vec3 subtleSunColor = mix(vec3(1.0), uSunColor, 0.32);
	vec3 subtleLightColor = mix(vec3(1.0), uLightColor, 0.24);
	
	vec3 sunRefl = subtleSunColor * sunSpecular * uSunIntensity * 3.0 * (1.0 + fresnel);
	vec3 secondaryRefl = subtleLightColor * lightSpecular * uLightIntensity * 2.0 * (1.0 + fresnel * 0.5);
	
	float caustic = getCaustics(texCoord, normal, velocity);
	float causticAttenuation = (1.0 - waterDepth) * (1.0 - scatter * 0.7);
	vec3 causticColor = vec3(1.0, 0.97, 0.9) * caustic * uCausticStrength * uCausticBrightness * causticAttenuation * 1.2;
	
	vec3 envColor = mix(uSkyColor, vec3(1.0), reflectionStrength);
	vec3 reflectionColor = mix(refractColor, envColor, reflectionStrength) * uEnvMapIntensity * uReflectionFresnel;
	
	vec3 finalColor = mix(waterColor, reflectionColor, reflectionStrength);
	finalColor += sunRefl + secondaryRefl + causticColor;
	
	finalColor = mix(finalColor, uSkyColor, scatter * uAtmosphericScatter);
	
	fragColor = vec4(clamp(finalColor, 0.0, 1.0), 1.0);
}`;

		if(DEBUG)
			console.log("physics program");

		this.physicsProgram = this.createProgram(
			VERTEX_SHADER,
			PHYSICS_SHADER
		);

		if(DEBUG)
			console.log("render program");

		this.renderProgram = this.createProgram(
			VERTEX_SHADER,
			RENDER_SHADER
		);

	}

	async initShadersZip() {

		if(DEBUG)
			console.log("init shaders zip");

		const VERTEX_SHADER = await this.decompress("H4sIAAAAAAAAClMuSy0qzszPUzA2MFBILebKzFMoS002UijIL84syczPs84vLYGIlKRWOOfnF6VYl+VnpijkJmbmaWhWwwRtYeq19Ey19Uyt03PiA6AitmWpySYaMHkdAx1DTetaAIBqaOZ3AAAA");
		const PHYSICS_SHADER = await this.decompress("H4sIAAAAAAAACoVUXW/bIBR936+wNGkCh2A7TdZt1J20dm97iJpKe5j6gGxsI9nG4iNNV+W/T2DskHTT3uDCveecy+G+3zOpuOijqzSNmHo3SFZwF2h43QxR1QqqyWVU0W5omVzdE9PzSsgu2rNiFZkHpkRrNBf9fOAKROaetZo+8o4hc8/V0NKXXUFbhsyO/2bfqGLI/KR7thsYK5G5p93A+xqZrRQDramt6I7msjODyGwl23Nh1E5TzS4IPQpTNL+y9GmO81778J0wvSZKS1PoyEVeXdIgFHcSRuqSltwov1Fasr7Wjd9qSXk7HQ2S0ZIcZyRX0mNtqaSdckR4P3LT7HAnhCyJMNpG1lElaX0nWiF9xZrpRwvwvapYoYHLKoyUrNdbodBIVrK93YQc/Oa5odp2F76ekpa5T/AQndizH6zPW6cKnC5CwivgT28ytlxDybSRfZRi4sNJPiGQU16S+1PigfJJZxy4Y3nOgrair53UvBQaTJpCNh79dPM2T/HXFH/p6AGkGGV46TX47OXpahwUSibOydgrGHu+MV6T417wMuoo7wH0XuAH1uZ2CTKYhP52L6as5axCbSQD505Ek3DoVTaM143OXQ4+IGW6PMWkEhJYT/I8JfwmWxG+WMBX35e+blnu1oDDGG9WV5vPn66vN0SZbvEv3KKl3QAm9IUjXwgFXDWIFO/9EsZOXvzmlzlrgRQiLxxCfCBHS7jjBzDqsPyTbIXjFV6Okl6CLwzj6Q+TczPm9r2CPuIDCncvEGmhqbf82/6EPzdoVMmVnjwM/mo4Pwn4E0zA/ygk81CCECk7psoHNwTys8/Mn7CfDbwClsFNeHeipm2Gl3OZPk2TeBDPQHVC6EZpNoCwDkoxssUhyvAGxvijRbss5ObQbYo/fOC3KQwgF28w3dX4YrTM3UHTaplN64DuOF3muUKCp1rkASo5HkeDns7JPNzsb1oDZTrkjZSiDJLjHw4nVcaJBgAA");
		const RENDER_SHADER = await this.decompress("H4sIAAAAAAAACo1XS4/bNhC+91cY6IWkaEay10gDrQ7dbIIUaIJgnaSHxR5YmbaJyKJAkVo7xf73gi+9nfawXpEcfTOcxzejXxsmay7KxTqOF6z+pZIs53bjyA/HarEvBFXpeLemp6pgcnWf6pLvhTwtGpavFvqB1aLQiouyPbAAC/2FnxjW97yuCnrZ5rRgrUQLttB/UcXkB8YPR4X1Hc2/H6TQ5e4LOystGdafJWu40PVWUcX6utcLvdXlPZcsN9qx/tNgtOuxNVtd/lEqVtZcXbxsu57CvhWFkF7MP1tD7fP0oqXaKsnKgzpiva1Yrgsqu50HoQ/HktU11u8lq0tWvNvvWa7a5WfxzGT3pl8+sH3h7uLF+lv3vFZCDi7qjf9+mTXynlXq+J7mytzld3USdXVkkufbnCpl1L0rm4+06vnoLdW14nl3j7BhQtmtKsZ27epOGo+5u/qte6YoL4z/GtbZ36F+5FIKOXfyjRUi5+rSc4S3v9u5K7RbS+rCzkuXmIqd3wohd6nQyuzcLPaSHpxrrKcOTH0S8kQLYOUrfmYFNsLOYY1XDv9xed5kLaJF21FFzZbJUjDM4gam4e0MGDlyXtp/F4iG9WCVomxFUt1kRg+4ghjZQytOzjiGkJyXV0SXU1H8U9QYO+HLf6MORCEim9Q5q7SODJHLEhLRv2vQuhDZC6JsKDbyhWRKy9JD8R/MhGUNdIMTCNMXp+fAlM+q2h57aTwOGd+DcfreZjGBXkdMUhvU3GN9/dYGFw2yPHL45HxB87XXxtmyHRoUhdPxTGXlQlvzEnQayQWtSNSajEen5/4pSsgaQkSStJOIMoPs/b+zNZYNSw79RlJ/MAF3+516NDFuJGFNCDFyZ4hsIrLphabz0CA49rnw5OxWDWfPZjGOm1t/2gn1ITvRM9gJBTxKlxcBKvIoEOKYQEyL6kizjmxRj3ft2Sqz/5D9TZ24VYXcL3BSy4TAKCHhrid+9gevAM1FDcw56iFBdJ3CKvEMLPiI3CECkxpJYgLRNZasT0KoY61YBWKCE4KH716lSpSQFYRo0pTQyLvBp9aV6YsNkmvShmAl23WdGXg+9MGTdMd1jTsOtdXndm8zEsdJqLqWWWa6fAPJ+fLDVYzY72um6sfNk62bxyfguAdaJSDB4WnZPcY4aZ+WhjCccc+WviyU3Xh8AmSDSbIa/0DXE3LTHjJLPDFM90ICXqoFz+KU325SHkW+GzjXfG2yvKCnCugmCkbzJ+TujlxDsdGCqQWOsp+4IEBaR6BgOH9KX7z7LET60gi+W5woL4G3xerJEvKqP4r1q8zfBxsfpcOKS3t1mnUN0ZneplcgmZb2XG5lJ16CMc/b21pU6Xqy7bjZtVxy/gvkO6Jb39K9D8dd35bQ2CboGhRMJ8ZOKqhVPW13wR5IzmgwODlLgkNqNzr5JBhrRHNTlr/K3g10meGHhCxHxRh4zdKaORvOicYCNJwkTZljOaGN6aW9YohrXQZOyIbUPeHbwZgNg3Vdejjy+N9owzF9Bq9rqv123zaTNinDOGfy+8ZnkmHr8NdPQGw2eiM8budkRNbYBxLiaQz7s70lUzwPHeBsfwMJnInG7B4az91oZu6feS8yWoOu7ouFrFcQ9WKLBt89aE1s1YQsGIL0PnbI6gaiQVjR6JMJrQZQiGxg5JAwefMakzcQtaPDeBRD068FBEwdTKrZqFj66CDyGkKb6J2zw9FMqcFQawlMX/4FdhFFoPMOAAA=");

		this.physicsProgram = this.createProgram(
			VERTEX_SHADER,
			PHYSICS_SHADER
		);

		this.renderProgram = this.createProgram(
			VERTEX_SHADER,
			RENDER_SHADER
		);
	
	}

	async decompress(b64Str, format = "gzip") {

		return await new Response(new Response(Uint8Array.from(
			atob(b64Str),
			c =>
				c.charCodeAt(0)
		)).body.pipeThrough(new DecompressionStream(format)))
		.text();
	
	}

	initBuffers() {

		if(DEBUG)
			console.log("init buffers");

		this.vertexBuffer = this.gl.createBuffer();

		this.gl.bindBuffer(
			this.gl.ARRAY_BUFFER,
			this.vertexBuffer
		);

		this.gl.bufferData(
			this.gl.ARRAY_BUFFER,
			this.vertices,
			this.gl.STATIC_DRAW
		);
	
	}

	syncSize() {

		this.ww = this.wrap.offsetWidth;
		this.wh = this.wrap.offsetHeight;

		this.sizeBase = +Math.max(
			0.4,
			Math.min(
				1.0,
				0.4 + 0.6 * Math.log10(Math.max(
					this.ww,
					this.wh
				) / 420)
			)
		)
		.toFixed(3); // needs fixed ?

		this.deltaTime = this.BASE_SCALE / this.DISP_SCALE;

		if(DEBUG)
			console.log(
				"screen",
				this.ww + "x" + this.wh,
				"fact",
				this.sizeBase
			);
	
	}

	syncCanvas() {

		const cw = Math.round(this.ww * this.DISP_SCALE);
		const ch = Math.round(this.wh * this.DISP_SCALE);

		this.cvs.width = this.bck.width = cw;
		this.cvs.height = this.bck.height = ch;

		if(DEBUG)
			console.log(
				"canvas",
				cw + "x" + ch
			);
	
	}

	fadeCanvas(op) {

		return new Promise(res => {

			this.cvs.addEventListener(
				"transitionend",
				() =>
					res(),
				{
					once: true
				}
			);

			this.cvs.style.opacity = op;
		
		});
	
	}

	syncViewport() {

		this.gl.viewport(
			0,
			0,
			this.w,
			this.h
		);
	
	}

	syncUniforms() {

		// force prev even value
		this.scaledPropagation = 2 * Math.floor((this.params.propagationSpeed * this.DISP_SCALE) / this.BASE_SCALE / 2);
		// this.scaledPropagation = 2 * Math.floor(this.params.propagationSpeed / this.DISP_SCALE * (Math.max(this.w, this.h) / this.REF_SIZE) / 2);
		this.uniformize();
	
	}

	uniformize() {

		this.dirtyPhysics = true;
		this.dirtyRenders = true;
	
	}

	initTextures() {

		if(DEBUG)
			console.log("init textures");

		const gl = this.gl;

		this.waterTexture1 = this.createWaterTexture();
		this.waterTexture2 = this.createWaterTexture();

		this.backgroundTexture = this.createBackgroundTexture();

		this.framebuffer1 = this.createFrameBuf(this.waterTexture1);
		this.framebuffer2 = this.createFrameBuf(this.waterTexture2);

		this.currentFramebuffer = this.framebuffer1;

		this.currentTexture = this.waterTexture1;
		this.previousTexture = this.waterTexture2;

		gl.bindFramebuffer(
			gl.FRAMEBUFFER,
			null
		);
		gl.bindTexture(
			gl.TEXTURE_2D,
			null
		);
	
	}

	createWaterTexture() {

		const gl = this.gl;
		const texture = gl.createTexture();

		gl.bindTexture(
			gl.TEXTURE_2D,
			texture
		);
		gl.texImage2D(
			gl.TEXTURE_2D,
			0,
			gl.RGBA32F,
			this.w,
			this.h,
			0,
			gl.RGBA,
			gl.FLOAT,
			null
		);
		gl.texParameteri(
			gl.TEXTURE_2D,
			gl.TEXTURE_MIN_FILTER,
			gl.NEAREST
		);
		gl.texParameteri(
			gl.TEXTURE_2D,
			gl.TEXTURE_MAG_FILTER,
			gl.NEAREST
		);
		gl.texParameteri(
			gl.TEXTURE_2D,
			gl.TEXTURE_WRAP_S,
			gl.CLAMP_TO_EDGE
		);
		gl.texParameteri(
			gl.TEXTURE_2D,
			gl.TEXTURE_WRAP_T,
			gl.CLAMP_TO_EDGE
		);

		const waterError = gl.getError();

		if(waterError !== gl.NO_ERROR) {

			throw new Error("create water texture fail");
		
		}

		return texture;
	
	}

	createBackgroundTexture() {

		const gl = this.gl;
		const texture = gl.createTexture();

		gl.bindTexture(
			gl.TEXTURE_2D,
			texture
		);
		gl.texImage2D(
			gl.TEXTURE_2D,
			0,
			gl.RGBA,
			this.w,
			this.h,
			0,
			gl.RGBA,
			gl.UNSIGNED_BYTE,
			null
		);
		gl.texParameteri(
			gl.TEXTURE_2D,
			gl.TEXTURE_MIN_FILTER,
			gl.LINEAR
		);
		gl.texParameteri(
			gl.TEXTURE_2D,
			gl.TEXTURE_MAG_FILTER,
			gl.LINEAR
		);
		gl.texParameteri(
			gl.TEXTURE_2D,
			gl.TEXTURE_WRAP_S,
			gl.CLAMP_TO_EDGE
		);
		gl.texParameteri(
			gl.TEXTURE_2D,
			gl.TEXTURE_WRAP_T,
			gl.CLAMP_TO_EDGE
		);

		return texture;
	
	}

	createFrameBuf(texture) {

		const gl = this.gl;
		const framebuffer = gl.createFramebuffer();

		gl.bindFramebuffer(
			gl.FRAMEBUFFER,
			framebuffer
		);
		gl.framebufferTexture2D(
			gl.FRAMEBUFFER,
			gl.COLOR_ATTACHMENT0,
			gl.TEXTURE_2D,
			texture,
			0
		);

		const frameBufferStatus = gl.checkFramebufferStatus(gl.FRAMEBUFFER);

		if(frameBufferStatus !== gl.FRAMEBUFFER_COMPLETE) {

			throw new Error(`incomplete framebuffer ${frameBufferStatus}`);
		
		}

		return framebuffer;
	
	}

	syncTextures() {

		if(DEBUG)
			console.log("sync textures");

		this.updateTextures();
		this.updateBackgroundTexture();
	
	}

	handleResize() {

		clearTimeout(this.sizing);
		this.fadeCanvas(0);
		this.sizing = setTimeout(
			() =>
				this.doResize(),
			128
		);
	
	}

	doResize() {

		if(DEBUG)
			console.log("window resize");

		this.stopPerfCheck();
		this.amplify.mask(true);

		Promise.resolve()
		.then(() => {

			this.amplify.updateBounds();
			this.syncLiquid();
			this.fadeCanvas(1);
			this.amplify.mask(false);
			this.startPerfCheck(2000);
		
		});
	
	}

	syncLiquid() {

		this.syncSize();
		this.syncCanvas();
		this.syncUniforms();
		this.syncViewport();
		this.syncTextures();
	
	}

	updateTextures() {

		if(DEBUG)
			console.log("update textures");

		const gl = this.gl;

		[this.waterTexture1, this.waterTexture2].forEach(texture => {

			gl.bindTexture(
				gl.TEXTURE_2D,
				texture
			);
			gl.texImage2D(
				gl.TEXTURE_2D,
				0,
				gl.RGBA32F,
				this.w,
				this.h,
				0,
				gl.RGBA,
				gl.FLOAT,
				null
			);
		
		});

		[this.framebuffer1, this.framebuffer2].forEach(framebuffer => {

			gl.bindFramebuffer(
				gl.FRAMEBUFFER,
				framebuffer
			);

			if(gl.checkFramebufferStatus(gl.FRAMEBUFFER) !== gl.FRAMEBUFFER_COMPLETE) {

				throw new Error("incomplete resized framebuffer");
			
			}
		
		});

		gl.bindFramebuffer(
			gl.FRAMEBUFFER,
			null
		);
	
	}

	initUniforms() {

		if(DEBUG)
			console.log("init uniforms");

		const getUniforms = (prgm, prop) =>
			Object.keys(prop)
			.reduce(
				(uniforms, uniform) =>
					({
						...uniforms,
						[uniform]: this.gl.getUniformLocation(
							prgm,
							`u${prop[uniform]}`
						)
					}),
				{}
			);

		this.physics = {
			...getUniforms(
				this.physicsProgram,
				{
					resolution: "Resolution",
					displayScale: "DisplayScale",
					sizeBase: "SizeBase",
					deltaTime: "DeltaTime",
					time: "Time",
					waveSpeed: "WaveSpeed",
					damping: "Damping",
					propagationSpeed: "PropagationSpeed",
					previousState: "PreviousState",
					touchPositions: "Touch",
					touchCount: "TouchCount"
				}
			),
			touches: new Array(10)
			.fill({})
			.map((_, i) => {

				const uTouch = `TouchParams[${i}].`;

				return getUniforms(
					this.physicsProgram,
					{
						position: `${uTouch}position`,
						radius: `${uTouch}radius`,
						damping: `${uTouch}damping`,
						strength: `${uTouch}strength`,
						trail: `${uTouch}trail`,
						spread: `${uTouch}spread`,
						angle: `${uTouch}angle`
					}
				);
			
			})
		};

		this.renders = getUniforms(
			this.renderProgram,
			{
				resolution: "Resolution",
				time: "Time",
				displayScale: "DisplayScale",
				previousState: "PreviousState",
				waterHeight: "WaterHeight",
				backgroundTexture: "BackgroundTexture",
				sunDirection: "SunDirection",
				lightDirection: "LightDirection",
				sunIntensity: "SunIntensity",
				lightIntensity: "LightIntensity",
				sunColor: "SunColor",
				lightColor: "LightColor",
				refraction: "Refraction",
				waterColor: "WaterColor",
				tintStrength: "TintStrength",
				specularStrength: "SpecularStrength",
				roughness: "Roughness",
				fresnelEffect: "FresnelEffect",
				fresnelPower: "FresnelPower",
				specularPower: "SpecularPower",
				skyColor: "SkyColor",
				depthFactor: "DepthFactor",
				atmosphericScatter: "AtmosphericScatter",
				envMapIntensity: "EnvMapIntensity",
				reflectionFresnel: "ReflectionFresnel",
				reflectionBlur: "ReflectionBlur",
				reflectionDistortion: "ReflectionDistortion",
				causticStrength: "CausticStrength",
				causticScale: "CausticScale",
				causticSpeed: "CausticSpeed",
				causticBrightness: "CausticBrightness",
				causticDetail: "CausticDetail",
				waveReflectionStrength: "WaveReflectionStrength",
				mirrorReflectionStrength: "MirrorReflectionStrength",
				velocityReflectionFactor: "VelocityReflectionFactor"
			}
		);
	
	}

	createProgram(vertexSource, fragmentSource) {

		const gl = this.gl;

		const program = gl.createProgram();

		const createShader = (type, source) => {

			const shader = gl.createShader(type);

			gl.shaderSource(
				shader,
				source
			);
			gl.compileShader(shader);

			if(!gl.getShaderParameter(
				shader,
				gl.COMPILE_STATUS
			)) {

				const shaderInfo = gl.getShaderInfoLog(shader);

				gl.deleteShader(shader);

				throw new Error(`compile shader fail ${shaderInfo}`);
			
			}

			return shader;
		
		};

		let vertShader, fragShader;

		try {

			vertShader = createShader(
				gl.VERTEX_SHADER,
				vertexSource
			);
			fragShader = createShader(
				gl.FRAGMENT_SHADER,
				fragmentSource
			);

			gl.attachShader(
				program,
				vertShader
			);
			gl.attachShader(
				program,
				fragShader
			);
			gl.linkProgram(program);

			if(!gl.getProgramParameter(
				program,
				gl.LINK_STATUS
			)) {

				const programInfo = gl.getProgramInfoLog(program);

				throw new Error(`link program fail ${programInfo}`);
			
			}
		
		}
		catch(programError) {

			throw programError;
		
		}
		finally {

			if(vertShader)
				gl.deleteShader(vertShader);

			if(fragShader)
				gl.deleteShader(fragShader);
		
		}

		return program;
	
	}

	physicsStep() {

		const gl = this.gl;

		gl.useProgram(this.physicsProgram);

		gl.bindFramebuffer(
			gl.FRAMEBUFFER,
			this.currentFramebuffer
		);

		if(this.dirtyPhysics) {

			gl.uniform2f(
				this.physics.resolution,
				this.w,
				this.h
			);

			gl.uniform1f(
				this.physics.displayScale,
				this.DISP_SCALE
			);

			gl.uniform1f(
				this.physics.sizeBase,
				this.sizeBase
			);

			gl.uniform1f(
				this.physics.waveSpeed,
				this.params.waveSpeed
			);

			gl.uniform1f(
				this.physics.damping,
				this.params.damping
			);

			gl.uniform1f(
				this.physics.propagationSpeed,
				this.scaledPropagation
			);

			this.dirtyPhysics = false;
		
		}

		gl.uniform1f(
			this.physics.deltaTime,
			this.deltaTime
		);
		gl.uniform1f(
			this.physics.time,
			this.accumulatedTime
		);

		gl.bindBuffer(
			gl.ARRAY_BUFFER,
			this.vertexBuffer
		);

		const positionLoc = gl.getAttribLocation(
			this.physicsProgram,
			"position"
		);

		gl.enableVertexAttribArray(positionLoc);

		gl.vertexAttribPointer(
			positionLoc,
			2,
			gl.FLOAT,
			false,
			0,
			0
		);

		// also check dirty ?
		this.processTouches();

		gl.activeTexture(gl.TEXTURE0);

		gl.bindTexture(
			gl.TEXTURE_2D,
			this.previousTexture
		);

		gl.uniform1i(
			this.physics.previousState,
			0
		);

		gl.drawArrays(
			gl.TRIANGLE_STRIP,
			0,
			4
		);
	
	}

	processTouches() {

		const gl = this.gl;

		const touchArray = Array.from(this.pops.values());

		const touchCount = Math.min(
			touchArray.length,
			this.MAX_TOUCHES
		);

		gl.uniform1i(
			this.physics.touchCount,
			touchCount
		);

		if(touchCount === 0)
			return;

		this.touchPositions.fill(0);

		for(let i = 0; i < touchCount; i++) {

			const touch = touchArray[i];
			
			// update positions
			this.touchPositions[i * 2] = touch.x;
			this.touchPositions[i * 2 + 1] = touch.y;
			this.touchPositions[(i + touchCount) * 2] = touch.px;
			this.touchPositions[(i + touchCount) * 2 + 1] = touch.py;
			
			// touch params, not fully implemented
			const touchUniform = this.physics.touches[i];

			gl.uniform2f(
				touchUniform.position,
				touch.x,
				touch.y
			);

			gl.uniform1f(
				touchUniform.radius,
				touch.touchRadius
			);

			gl.uniform1f(
				touchUniform.damping,
				touch.touchDamping
			);

			gl.uniform1f(
				touchUniform.strength,
				touch.initialImpact
			);

			gl.uniform1f(
				touchUniform.trail,
				touch.trailStrength
			);

			gl.uniform1f(
				touchUniform.spread,
				touch.trailSpread
			);

			gl.uniform1f(
				touchUniform.angle,
				touch.trailAngle
			);
		
		}
		
		gl.uniform2fv(
			this.physics.touchPositions,
			this.touchPositions
		);
	
	}

	renderStep() {

		const gl = this.gl;

		gl.useProgram(this.renderProgram);

		gl.bindFramebuffer(
			gl.FRAMEBUFFER,
			null
		);

		gl.clearColor(
			0,
			0,
			0,
			1
		);

		gl.clear(gl.COLOR_BUFFER_BIT);

		gl.bindBuffer(
			gl.ARRAY_BUFFER,
			this.vertexBuffer
		);

		const positionLoc = gl.getAttribLocation(
			this.renderProgram,
			"position"
		);

		gl.enableVertexAttribArray(positionLoc);

		gl.vertexAttribPointer(
			positionLoc,
			2,
			gl.FLOAT,
			false,
			0,
			0
		);

		if(this.dirtyRenders)
			this.updateRenderUniforms();

		gl.uniform1f(
			this.renders.time,
			this.accumulatedTime
		);

		// batch texture bindings
		gl.activeTexture(gl.TEXTURE0);

		gl.bindTexture(
			gl.TEXTURE_2D,
			this.currentTexture
		);

		gl.uniform1i(
			this.renders.waterHeight,
			0
		);

		gl.activeTexture(gl.TEXTURE1);

		gl.bindTexture(
			gl.TEXTURE_2D,
			this.backgroundTexture
		);

		gl.uniform1i(
			this.renders.backgroundTexture,
			1
		);

		gl.activeTexture(gl.TEXTURE2);

		gl.bindTexture(
			gl.TEXTURE_2D,
			this.previousTexture
		);

		gl.uniform1i(
			this.renders.previousState,
			2
		);

		gl.drawArrays(
			gl.TRIANGLE_STRIP,
			0,
			4
		);

		const renderError = gl.getError();

		if(renderError !== gl.NO_ERROR) {

			throw new Error("render step error " + renderError);
		
		}
	
	}

	updateRenderUniforms() {

		const gl = this.gl;

		gl.uniform2fv(
			this.renders.resolution,
			[this.w, this.h]
		);

		gl.uniform1f(
			this.renders.displayScale,
			this.DISP_SCALE
		);

		Object.keys(this.params)
		.forEach(prop => {

			const value = this.params[prop];
			const rendr = this.renders[prop];

			if(typeof value === "number")
				gl.uniform1f(
					rendr,
					value
				);
			else if(value instanceof Array)
				gl.uniform3fv(
					rendr,
					value
				);

		});

		this.dirtyRenders = false;
	
	}

	updateBackgroundTexture() {

		if(!this.image?.complete)
			return;
	
		this.btx.fillStyle = "#000000";
		this.btx.fillRect(
			0,
			0,
			this.w,
			this.h
		);

		// flip coordinate system
		this.btx.save();

		this.btx.translate(
			0,
			this.h
		);

		this.btx.scale(
			1,
			-1
		);

		const imgW = this.image.naturalWidth;
		const imgH = this.image.naturalHeight;
		const screenAspect = this.w / this.h;
		const imageAspect = imgW / imgH;

		let sx, sy, sw, sh;

		if(screenAspect > imageAspect) {

			sw = imgW;
			sh = Math.round(imgW / screenAspect);
			sx = 0;
			sy = Math.round((imgH - sh) / 2);
		
		}
		else {

			sh = imgH;
			sw = Math.round(imgH * screenAspect);
			sy = 0;
			sx = Math.round((imgW - sw) / 2);
		
		}

		this.btx.drawImage(
			this.image,
			sx,
			sy,
			sw,
			sh,
			0,
			0,
			this.w,
			this.h
		);

		const customizer = getCustomizer();

		if(customizer.drawBackgroundOverlay) {

			this.btx.save();
			customizer.drawBackgroundOverlay(this.btx, this);
			this.btx.restore();
		
		}

		this.btx.restore();

		// update texture
		const gl = this.gl;

		gl.bindTexture(
			gl.TEXTURE_2D,
			this.backgroundTexture
		);

		gl.texImage2D(
			gl.TEXTURE_2D,
			0,
			gl.RGBA,
			gl.RGBA,
			gl.UNSIGNED_BYTE,
			this.bck
		);
	
	}

	toggleRender() {

		if(this.isRunning)
			this.stopRender();
		else
			this.startRender();
	
	}

	startRender() {

		if(this.isRunning)
			return;

		if(DEBUG)
			console.log("start loop");

		let perfCheck = this.SCALE_TIME;

		if(!this.lastFrameTime) {

			if(DEBUG)
				console.log("first loop");

			perfCheck *= 2;
		
		}

		this.isRunning = true;
		this.amplify.toggle("flow");
		this.lastFrameTime = performance.now();
		this.startPerfCheck(perfCheck);
		this.nextFrame();
	
	}

	stopRender() {

		if(!this.isRunning)
			return;

		if(DEBUG)
			console.log("stop loop");

		this.isRunning = false;
		cancelAnimationFrame(this.loop);
		this.stopPerfCheck();
		this.amplify.toggle(
			"flow",
			false
		);
	
	}

	nextFrame() {

		this.loop = requestAnimationFrame(hrts =>
			this.renderLoop(hrts));
	
	}

	renderLoop(currentTime) {

		this.accumulatedTime += this.deltaTime;
		this.nextFrame();

		this.physicsStep();
		this.swapBuffers();
		this.renderStep();

		this.checkPerfs(currentTime);
	
	}

	startPerfCheck(chk = this.SCALE_TIME) {

		if(this.PERF_CHECK)
			return;
	
		if(DEBUG)
			console.log(
				"perf run",
				chk
			);
	
		this.PERF_CHECK = true;

		this.frameTimeHistory = new Array(this.FRAME_SIZE)
		.fill(16.67); // ~60fps default
		this.frameTimeSum = this.FRAME_SIZE * 16.67;
		this.frameTimeIndex = 0;
	
		this.notBefore = this.lastFrameTime + chk;
	
	}

	stopPerfCheck() {

		if(!this.PERF_CHECK)
			return;

		if(DEBUG)
			console.log("perf stop");

		this.renderInfo("--");
		this.PERF_CHECK = false;
		this.LOOP_COUNT = 0;
		this.currentFPS = 0;
	
	}

	checkPerfs(currentTime) {

		const frameTime = currentTime - this.lastFrameTime;

		this.lastFrameTime = currentTime;
	
		this.frameTimeHistory[this.frameTimeIndex] = frameTime;
		this.frameTimeIndex = (this.frameTimeIndex + 1) & (this.frameTimeHistory.length - 1);
	
		this.frameTimeSum = this.frameTimeSum - this.frameTimeHistory[this.frameTimeIndex] + frameTime;
		const avgFrameTime = this.frameTimeSum / this.frameTimeHistory.length;
		
		const updatedFPS = Math.round(1000 / avgFrameTime);
	
		if(updatedFPS !== this.currentFPS) {

			this.currentFPS = updatedFPS;
			this.renderInfo(("" + updatedFPS).padStart(
				2,
				"0"
			));
		
		}
	
		if(!this.PERF_CHECK || currentTime < this.notBefore)
			return;
	
		if(currentTime - this.lastScaleCheck >= this.SCALE_TIME) {

			this.lastScaleCheck = currentTime;
			this.LOOP_COUNT++;
	
			if(this.LOOP_COUNT >= this.LOOPS_TO_SCALE) {

				this.LOOP_COUNT = 0;
	
				if(this.currentFPS < this.TARGET_FPS) {

					this.downScale();
				
				}
				else if(
					this.ENABLE_UPSCALE
					&& this.DISP_SCALE < this.DOWN_FROM
					&& this.DISP_SCALE < this.MAX_SCALE
				) {

					this.upScale();
				
				}
			
			}
		
		}
	
	}

	downScale() {

		if(this.DISP_SCALE === this.MIN_SCALE)
			return;

		if(DEBUG)
			console.log("downscale");

		this.DOWN_FROM = this.DISP_SCALE - this.SCALE_STEP;

		this.setDisplayScale(this.DISP_SCALE - this.SCALE_STEP);
	
	}

	upScale() {

		if(this.DISP_SCALE == this.MAX_SCALE)
			return;

		if(DEBUG)
			console.log("upscale");

		this.setDisplayScale(this.DISP_SCALE + this.SCALE_STEP);
	
	}

	setDisplayScale(scale) {

		if(scale === this.DISP_SCALE)
			return;

		this.stopPerfCheck();

		this.DISP_SCALE = Math.max(
			this.MIN_SCALE,
			Math.min(
				this.MAX_SCALE,
				scale
			)
		);
		
		this.syncLiquid();
		this.startPerfCheck();
	
	}

	renderText(str) {

		window.requestAnimationFrame(() =>
			(this.infos.textContent = str));
	
	}

	renderInfo(fps) {

		this.infos.textContent = (DEBUG ? this.ww + "x" + this.wh + "\n" : "") + "x" + this.DISP_SCALE.toString() + " " + fps;
	
	}

	visibleChange() {

		this.isVisible = document.visibilityState === "visible";

		if(DEBUG)
			console.log(this.isVisible ? "visible" : "hidden");

		this.activeChange();
	
	}

	handleBlur() {

		this.focusChange(false);
	
	}

	handleFocus() {

		this.focusChange(true);
	
	}

	focusChange(focused) {

		if(DEBUG)
			console.log(focused ? "focus" : "blur");

		this.isFocused = focused;
		this.activeChange();
	
	}

	activeChange() {

		if(this.isActive)
			this.startRender();
		else
			this.stopRender();
	
	}

	handleHash() {

		if(DEBUG)
			console.log("hash changed");

		this.load(this.amplify.hashParams());
	
	}

	swapBuffers() {

		[this.currentFramebuffer, this.currentTexture, this.previousTexture] = [
			this.currentFramebuffer === this.framebuffer1 ? this.framebuffer2 : this.framebuffer1,
			this.currentTexture === this.waterTexture1 ? this.waterTexture2 : this.waterTexture1,
			this.previousTexture === this.waterTexture1 ? this.waterTexture2 : this.waterTexture1
		];
	
	}

	resetWater() {

		if(DEBUG)
			console.log("reset water");

		const gl = this.gl;
		const flat = new Float32Array(this.w * this.h * 4);

		for(let i = 0; i < flat.length; i += 4) {

			flat[i] = 0.0; // height
			flat[i + 1] = 0.0; // prev height
			flat[i + 2] = 0.0; // velocity
			flat[i + 3] = 1.0; // alpha
		
		}

		[this.waterTexture1, this.waterTexture2].forEach(texture => {

			gl.bindTexture(
				gl.TEXTURE_2D,
				texture
			);

			gl.texImage2D(
				gl.TEXTURE_2D,
				0,
				gl.RGBA32F,
				this.w,
				this.h,
				0,
				gl.RGBA,
				gl.FLOAT,
				flat
			);
		
		});

		this.currentFramebuffer = this.framebuffer1;
		this.currentTexture = this.waterTexture1;
		this.previousTexture = this.waterTexture2;
	
	}

	setupEvents() {

		if(DEBUG)
			console.log("setup events");

		document.addEventListener(
			"visibilitychange",
			() =>
				this.visibleChange()
		);
		
		Object.entries({
			"blur": this.handleBlur,
			"focus": this.handleFocus,
			"resize": this.handleResize,
			"hashchange": this.handleHash
		})
		.forEach(([evtName, evtCall]) =>
			window.addEventListener(
				evtName,
				evtCall.bind(this)
			));

		Object.entries({
			"touchstart": this.doNotTouch,
			"pointerdown": this.handlePointerStart,
			"pointermove": this.handlePointerMove,
			"pointerup": this.handlePointerEnd,
			"pointerout": this.handlePointerEnd,
			"pointercancel": this.handlePointerEnd
		})
		.forEach(([evtName, evtCall]) =>
			this.cvs.addEventListener(
				evtName,
				evtCall.bind(this)
			));
	
	}

	// pointers handling

	genPopId() {

		return Math.random()
		.toString(36)
		.slice(-6);
	
	}

	getPointerPos(evt) {

		// const cx = evt.clientX - this.wrap.offsetLeft;
		// const cy = evt.clientY - this.wrap.offsetTop;

		const cx = evt.offsetX;
		const cy = evt.offsetY;

		return {
			x: cx * this.DISP_SCALE,
			y: this.h - cy * this.DISP_SCALE,
			rx: cx,
			ry: cy
		};
	
	}

	pointOptions() {

		return {
			touchRadius: this.params.touchRadius,
			touchDamping: this.params.touchDamping,
			initialImpact: this.params.initialImpact,
			trailStrength: this.params.trailStrength,
			trailSpread: this.params.trailSpread,
			trailAngle: this.params.trailAngle
		};
	
	}

	doNotTouch(evt) {

		evt.preventDefault();
	
	}

	handlePointerStart(evt) {

		const pId = evt.pointerId;

		if(!this.isTouched)
			this.isTouched = true;

		this.cvs.setPointerCapture(pId);
		const pos = this.getPointerPos(evt);

		this.pops.set(
			pId,
			{
				x: pos.x,
				y: pos.y,
				px: pos.x,
				py: pos.y,
				...this.pointOptions()
			}
		);
	
	}

	handlePointerMove(evt) {

		const pId = evt.pointerId;

		if(this.pops.has(pId)) {

			const pop = this.pops.get(pId);
			const pos = this.getPointerPos(evt);

			pop.px = pop.x;
			pop.py = pop.y;
			pop.x = pos.x;
			pop.y = pos.y;
			pop.rx = pos.rx;
			pop.ry = pos.ry;

			this.hitParams();
		
		}
	
	}

	handlePointerEnd(evt) {

		const pId = evt.pointerId;

		if(this.pops.has(pId)) {

			this.cvs.releasePointerCapture(pId);
			this.pops.delete(pId);
			this.hitParams();
		
		}
	
	}

	hitParams() {

		if(this.amplify.pop) {

			const hit = Array.from(this.pops.values())
			.some(pop =>
				this.hitPoint(
					pop.rx,
					pop.ry,
					this.amplify.bnd
				));

			if(hit !== this.hits) {

				this.hits = hit;
				clearTimeout(this.hitting);
				this.hitting = setTimeout(
					() =>
						this.amplify.mask(this.hits),
					100
				);
			
			}
		
		}
	
	}

	hitPoint(px, py, bnd) {

		return (
			px >= bnd.x
			&& px <= bnd.x + bnd.w
			&& py >= bnd.y
			&& py <= bnd.y + bnd.h
		);
	
	}

	// getters

	get w() {

		return this.cvs.width;
	
	}

	get h() {

		return this.cvs.height;
	
	}

	get isActive() {

		return (this.isVisible || !this.PAUSE_HIDE) && (this.isFocused || !this.PAUSE_BLUR);
	
	}

	// utils

	randRange(min, max) {

		return Math.floor(Math.random() * (max - min + 1)) + min;
	
	}

	// effects

	dropIt(x, y, o = 75) {

		x ||= this.randRange(
			this.w * 0.3,
			this.w * 0.7
		);
		y ||= this.randRange(
			this.h * 0.3,
			this.h * 0.7
		);

		const dropId = "drop_" + this.genPopId();
		const point = {
			x,
			y,
			px: x,
			py: y,
			...this.pointOptions()
		};

		this.pops.set(
			dropId,
			point
		);
		setTimeout(
			() =>
				this.pops.delete(dropId),
			o + Math.round(Math.random() * 100)
		);
	
	}

	curveIt() {

		const centerX = this.w * 0.5;
		const centerY = this.h * 0.5;
		const offCenterX = 0.3;
		const offCenterY = 0.3;

		const startX = centerX - this.w * offCenterX;
		const startY = centerY + (Math.random() - 0.5) * this.h * offCenterY;
		const endX = centerX + this.w * offCenterX;
		const endY = centerY + (Math.random() - 0.5) * this.h * offCenterY;
		const ctrlX = centerX + (Math.random() - 0.5) * this.w * 0.2;
		const ctrlY = centerY + (Math.random() - 0.5) * this.h * 0.4;

		const touchId = "curve_" + this.genPopId();
		const point = {
			x: startX,
			y: startY,
			px: startX,
			py: startY,
			...this.pointOptions()
		};

		this.pops.set(
			touchId,
			point
		);
		const startTime = performance.now();
		const duration = 1234;

		const animate = () => {

			const elapsed = performance.now() - startTime;
			const progress = elapsed / duration;

			if(progress >= 1) {

				this.pops.delete(touchId);

				return;
			
			}

			point.px = point.x;
			point.py = point.y;

			const t = progress;
			const invT = 1 - t;

			point.x = invT * invT * startX + 2 * invT * t * ctrlX + t * t * endX;
			point.y = invT * invT * startY + 2 * invT * t * ctrlY + t * t * endY;

			window.requestAnimationFrame(animate);
		
		};

		animate();
	
	}

	circleIt() {

		const centerX = this.w * 0.5;
		const centerY = this.h * 0.5;
		const radius = Math.min(
			this.w,
			this.h
		) * 0.05;
		const speed = 0.005;

		const touchId = "circle_" + this.genPopId();
		const startAngle = Math.random() * Math.PI * 2;

		const point = {
			x: centerX + Math.cos(startAngle) * radius,
			y: centerY + Math.sin(startAngle) * radius,
			px: centerX + Math.cos(startAngle) * radius,
			py: centerY + Math.sin(startAngle) * radius,
			...this.pointOptions(),
			touchRadius: 0.02
		};

		this.pops.set(
			touchId,
			point
		);
		const startTime = performance.now();

		const animate = () => {

			if(!this.pops.has(touchId))
				return;

			const elapsed = performance.now() - startTime;
			const angle = startAngle + elapsed * speed;

			point.px = point.x;
			point.py = point.y;
			point.x = centerX + Math.cos(angle) * radius;
			point.y = centerY + Math.sin(angle) * radius;

			requestAnimationFrame(animate);
		
		};

		animate();
	
	}

	snailIt() {

		const centerX = this.w * 0.5;
		const centerY = this.h * 0.5;
		const startX = centerX + (Math.random() - 0.5) * this.w * 0.3;
		const startY = centerY + (Math.random() - 0.5) * this.h * 0.3;

		const touchId = "curve_" + this.genPopId();
		const point = {
			x: startX,
			y: startY,
			px: startX,
			py: startY,
			...this.pointOptions(),
			touchRadius: 0.02,
			trailStrength: 0.12,
			trailSpread: 0.15
		};

		this.pops.set(
			touchId,
			point
		);

		const duration = 2500;
		const startTime = performance.now();
		const radiusX = this.w * 0.15;
		const radiusY = this.h * 0.15;
		const loops = 1.5 + Math.random();
		const drift = {
			x: (Math.random() - 0.5) * 0.3,
			y: (Math.random() - 0.5) * 0.3
		};

		const animate = () => {

			const elapsed = performance.now() - startTime;
			const progress = elapsed / duration;

			if(progress >= 1) {

				this.pops.delete(touchId);

				return;
			
			}

			point.px = point.x;
			point.py = point.y;

			const angle = progress * Math.PI * 2 * loops;

			point.x = startX + Math.cos(angle) * radiusX + drift.x * elapsed;
			point.y = startY + Math.sin(angle) * radiusY + drift.y * elapsed;

			requestAnimationFrame(animate);
		
		};

		animate();
	
	}

	// rain

	toggleRain() {

		if(this.isRaining)
			this.stopRain();
		else
			this.startRain();
	
	}

	startRain() {

		this.isRaining = true;
		this.lastRainDrop = 0;
		this.activeRaindrops = new Set();
		this.animateRain();
		this.amplify.toggle("rain");
	
	}

	animateRain() {

		if(!this.isRaining)
			return;

		const currentTime = performance.now();

		if(
			currentTime - this.lastRainDrop > this.rainDropDelay
			&& this.activeRaindrops.size < this.maxRaindrops
			&& this.pops.size < 8
		) {

			this.createRaindrop();
			this.lastRainDrop = currentTime;
		
		}

		requestAnimationFrame(() =>
			this.animateRain());
	
	}

	createRaindrop() {

		const x = Math.random() * this.w;
		const y = Math.random() * this.h;
		const dropId = "rain_" + this.genPopId();

		const impactPoint = {
			x,
			y,
			px: x,
			py: y,
			...this.pointOptions(),
			touchRadius: 0.02,
			// touchDamping: 0.35,
			initialImpact: 0.24
		};

		this.pops.set(
			dropId + "_impact",
			impactPoint
		);

		this.activeRaindrops.add(dropId);
		
		setTimeout(
			() => {

				this.pops.delete(dropId + "_impact");
				this.activeRaindrops.delete(dropId);
		
			},
			80
		);
	
	}

	stopRain() {

		this.isRaining = false;
		this.amplify.toggle(
			"rain",
			false
		);
	
	}
	
	// swirls

	createSwirl(x, y, radius, params, dur, startAngle, ease) {

		const popId = this.genPopId();
		const startTime = performance.now();

		const initialX = x + Math.cos(startAngle) * radius;
		const initialY = y + Math.sin(startAngle) * radius;

		const popped = {
			x: initialX,
			y: initialY,
			px: initialX,
			py: initialY,
			...this.pointOptions(),
			...params
		};

		this.pops.set(
			popId,
			popped
		);

		const updateSwirl = () => {

			const elapsed = performance.now() - startTime;
			const progress = elapsed / dur;

			if(progress < 1) {

				const angle = startAngle + elapsed * 0.001 * popped.speed;
				const easedProgress = ease(
					elapsed,
					0,
					1,
					dur
				);
				const currentRadius = radius * (1 - easedProgress);

				if(this.pops.has(popId)) {

					const pop = this.pops.get(popId);

					pop.px = pop.x;
					pop.py = pop.y;
					pop.x = x + Math.cos(angle) * currentRadius;
					pop.y = y + Math.sin(angle) * currentRadius;

					requestAnimationFrame(updateSwirl);
				
				}
			
			}
			else {

				this.pops.delete(popId);
			
			}
		
		};

		requestAnimationFrame(updateSwirl);
	
	}

	createSwirls() {

		if(DEBUG)
			console.log("swirls");

		let numSwirls = 3,
			radius = 0.3;

		for(let i = 0; i < numSwirls; i++) {

			this.createSwirl(
				this.w / 2,
				this.h / 2,
				Math.min(
					this.w,
					this.h
				) * radius,
				{
					// touchRadius: 0.02,
					// touchDamping: 0.995,
					// initialImpact: 0.32,
					// trailStrength: 1.2,
					// trailSpread: 1.6,
					// trailAngle: 500,
					speed: 2.5
				},
				3333,
				2 * Math.PI / numSwirls * i,
				this.sineIn
			);
		
		}
	
	}

	sineIn(t, b, c, d) {

		return -c * Math.cos((t / d) * (Math.PI / 2)) + c + b;
	
	}

	// auto

	toggleAutoTouch() {

		if(this.isAuto)
			this.stopAutoTouch();
		else
			this.startAutoTouch();
	
	}

	startAutoTouch() {

		if(this.isAuto)
			return;
		
		this.isAuto = true;
		const touchId = "auto";

		const config = {
			freqX: 0.15,
			freqY: 0.23,
			phaseX: 0,
			phaseY: Math.PI / 4,
			speedMin: 3,
			speedMax: 6,
			speedChangeRate: 0.004,
			speedChangeInterval: 3000,
			centerX: this.w * 0.5,
			centerY: this.h * 0.5,
			radiusX: this.w * 0.35,
			radiusY: this.h * 0.35
		};

		let time = 0;
		let currentSpeed = 2.5;
		let targetSpeed = 2.5;
		let lastSpeedChange = 0;

		const point = {
			x: config.centerX,
			y: config.centerY,
			px: config.centerX,
			py: config.centerY,
			...this.pointOptions()
		};

		this.pops.set(
			touchId,
			point
		);

		const updateSpeed = timestamp => {

			if(timestamp - lastSpeedChange > config.speedChangeInterval) {

				targetSpeed = config.speedMin + Math.random() * (config.speedMax - config.speedMin);
				lastSpeedChange = timestamp;
			
			}
			
			currentSpeed += (targetSpeed - currentSpeed) * config.speedChangeRate;

			return currentSpeed;
		
		};

		const animate = () => {

			if(!this.isAuto) {

				this.pops.delete(touchId);

				return;
			
			}

			point.px = point.x;
			point.py = point.y;

			const speed = updateSpeed(performance.now());

			time += 0.016 * speed;

			point.x = config.centerX + config.radiusX * Math.sin(config.freqX * time + config.phaseX);
			point.y = config.centerY + config.radiusY * Math.sin(config.freqY * time + config.phaseY);

			requestAnimationFrame(animate);
		
		};

		animate();
		this.amplify.toggle("point");
	
	}

	stopAutoTouch() {

		if(!this.isAuto)
			return;

		if(DEBUG)
			console.log("stop auto touch");

		this.isAuto = false;
		this.amplify.toggle(
			"point",
			this.isAuto
		);
	
	}

	// test

	toggleTest() {

		if(this.isTest)
			this.stopTest();
		else
			this.startTest();
	
	}

	startTest() {

		if(this.isTest)
			return;
		
		this.isTest = true;

		this.testLoop = setInterval(
			() => {

				const x = this.w / 2;
				const y = this.h / 2;
				const dropId = "test_" + this.genPopId();

				this.pops.set(
					dropId,
					{
						x,
						y,
						px: x,
						py: y,
						...this.pointOptions()
					}
				);
		
				setTimeout(
					() =>
						this.pops.delete(dropId),
					256
				);

			},
			500
		);
		
		this.amplify.toggle("test");
	
	}

	stopTest() {

		if(!this.isTest)
			return;

		if(DEBUG)
			console.log("stop test");

		clearInterval(this.testLoop);

		this.isTest = false;
		this.amplify.toggle(
			"test",
			this.isTest
		);
	
	}

}
