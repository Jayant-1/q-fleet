import React, { useEffect, useRef } from 'react';

interface Props {
  className?: string;
  intensity?: number; // 0.0 to 2.0, default 1.0
}

export const MatteNoiseShaderBackground: React.FC<Props> = ({
  className = '',
  intensity = 1.0,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Request WebGL context with fallback
    const gl =
      canvas.getContext('webgl', { powerPreference: 'low-power', antialias: false }) ||
      (canvas.getContext('experimental-webgl') as WebGLRenderingContext | null);

    if (!gl) {
      console.warn('WebGL not supported for MatteNoiseShaderBackground, falling back.');
      return;
    }

    // Vertex Shader: simple full-screen quad
    const vsSource = `
      attribute vec2 a_position;
      void main() {
        gl_Position = vec4(a_position, 0.0, 1.0);
      }
    `;

    // Fragment Shader: pure plain matte black with fine isotropic noise texture
    // Directly matching reference RGB distribution (mean ~19.5, std ~3.8, range [11..31])
    const fsSource = `
      precision highp float;
      uniform vec2 u_resolution;
      uniform float u_intensity;

      // High-speed gold ratio PRNG hash for ultra-fine isotropic film grain
      float hash(vec2 p) {
        vec3 p3 = fract(vec3(p.xyx) * 0.1031);
        p3 += dot(p3, p3.yzx + 33.33);
        return fract((p3.x + p3.y) * p3.z);
      }

      void main() {
        // Plain uniform matte black base matching user reference (#131315)
        vec3 baseColor = vec3(19.5 / 255.0, 19.5 / 255.0, 20.5 / 255.0);

        // High-frequency isotropic micro-noise
        // Zero clouds, zero white/grey washes, zero directional light, zero streaks
        vec2 p = gl_FragCoord.xy;
        float n1 = hash(p);
        float n2 = hash(p * 1.4142 + 19.17);
        float grain = (mix(n1, n2, 0.5) - 0.5) * (18.0 / 255.0) * u_intensity;

        // Strictly bound within dark matte black range [11..31] / 255
        vec3 col = clamp(baseColor + vec3(grain), vec3(11.0 / 255.0), vec3(31.0 / 255.0));

        gl_FragColor = vec4(col, 1.0);
      }
    `;

    // Compile shader helper
    const createShader = (type: number, source: string) => {
      const shader = gl.createShader(type);
      if (!shader) return null;
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error('Shader compile error:', gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
      }
      return shader;
    };

    const vertexShader = createShader(gl.VERTEX_SHADER, vsSource);
    const fragmentShader = createShader(gl.FRAGMENT_SHADER, fsSource);
    if (!vertexShader || !fragmentShader) return;

    const program = gl.createProgram();
    if (!program) return;
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error('Program link error:', gl.getProgramInfoLog(program));
      return;
    }

    gl.useProgram(program);

    // Quad geometry covering [-1, 1]
    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
      gl.STATIC_DRAW
    );

    const positionLocation = gl.getAttribLocation(program, 'a_position');
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

    const resolutionLocation = gl.getUniformLocation(program, 'u_resolution');
    const timeLocation = gl.getUniformLocation(program, 'u_time');
    const intensityLocation = gl.getUniformLocation(program, 'u_intensity');

    // Resize handler (throttled to physical pixels)
    let animationFrameId: number;
    let startTime = performance.now();

    const resize = () => {
      // Scale resolution down slightly (0.75x or 1x) for ultra-fast GPU compute
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      const width = Math.floor(window.innerWidth * dpr);
      const height = Math.floor(window.innerHeight * dpr);

      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
        gl.viewport(0, 0, width, height);
      }
    };

    window.addEventListener('resize', resize);
    resize();

    // Render loop
    const render = (now: number) => {
      const elapsedSeconds = (now - startTime) * 0.001;

      gl.uniform2f(resolutionLocation, canvas.width, canvas.height);
      gl.uniform1f(timeLocation, elapsedSeconds);
      gl.uniform1f(intensityLocation, intensity);

      gl.drawArrays(gl.TRIANGLES, 0, 6);

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
      gl.deleteProgram(program);
      gl.deleteShader(vertexShader);
      gl.deleteShader(fragmentShader);
      gl.deleteBuffer(positionBuffer);
    };
  }, [intensity]);

  return (
    <canvas
      ref={canvasRef}
      className={`fixed inset-0 pointer-events-none z-0 w-full h-full ${className}`}
      style={{
        display: 'block',
        backgroundColor: '#131315',
        backgroundImage: "url('/assets/matte_noise_seamless.png')",
        backgroundRepeat: 'repeat',
      }}
    />
  );
};
