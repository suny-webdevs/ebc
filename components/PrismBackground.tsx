'use client';

import React, { useEffect, useRef } from 'react';

interface PrismBackgroundProps {
  className?: string;
  speed?: number;
  intensity?: number;
  rayCount?: number;
  glow?: number;
  interactive?: boolean;
}

export function PrismBackground({
  className = '',
  speed = 1.0,
  intensity = 1.0,
  glow = 1.0,
  interactive = true,
}: PrismBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const mouseRef = useRef<{ x: number; y: number; targetX: number; targetY: number }>({
    x: 0.5,
    y: 0.5,
    targetX: 0.5,
    targetY: 0.5,
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext('webgl', {
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance',
    });

    if (!gl) {
      // Fallback 2D canvas animation if WebGL is not supported
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      let animationFrameId: number;
      let time = 0;

      const render2D = () => {
        time += 0.015 * speed;
        const width = canvas.width;
        const height = canvas.height;
        ctx.clearRect(0, 0, width, height);

        // Draw deep gradient background
        const grad = ctx.createRadialGradient(
          width * 0.5,
          height * 0.3,
          10,
          width * 0.5,
          height * 0.5,
          Math.max(width, height) * 0.8
        );
        grad.addColorStop(0, 'rgba(15, 23, 42, 1)');
        grad.addColorStop(1, 'rgba(2, 6, 23, 1)');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, width, height);

        // Draw prism rays
        const rays = 8;
        ctx.save();
        ctx.globalCompositeOperation = 'screen';
        for (let i = 0; i < rays; i++) {
          const angle = (i / rays) * Math.PI * 2 + time * 0.2;
          const hue = (i * (360 / rays) + time * 20) % 360;
          const gradRay = ctx.createLinearGradient(
            width * 0.5,
            height * 0.3,
            width * 0.5 + Math.cos(angle) * width * 0.8,
            height * 0.3 + Math.sin(angle) * height * 0.8
          );
          gradRay.addColorStop(0, `hsla(${hue}, 85%, 65%, ${0.25 * intensity})`);
          gradRay.addColorStop(0.5, `hsla(${(hue + 40) % 360}, 80%, 55%, ${0.12 * intensity})`);
          gradRay.addColorStop(1, 'rgba(0,0,0,0)');
          ctx.fillStyle = gradRay;
          ctx.beginPath();
          ctx.arc(width * 0.5, height * 0.3, Math.max(width, height), angle - 0.2, angle + 0.2);
          ctx.lineTo(width * 0.5, height * 0.3);
          ctx.fill();
        }
        ctx.restore();

        animationFrameId = requestAnimationFrame(render2D);
      };

      const handleResize2D = () => {
        canvas.width = canvas.parentElement?.clientWidth || window.innerWidth;
        canvas.height = canvas.parentElement?.clientHeight || window.innerHeight;
      };

      window.addEventListener('resize', handleResize2D);
      handleResize2D();
      render2D();

      return () => {
        window.removeEventListener('resize', handleResize2D);
        cancelAnimationFrame(animationFrameId);
      };
    }

    // WebGL Prism Shader Implementation
    const vertexShaderSource = `
      attribute vec2 a_position;
      void main() {
        gl_Position = vec4(a_position, 0.0, 1.0);
      }
    `;

    // High quality refractive spectral prism shader
    const fragmentShaderSource = `
      precision highp float;
      uniform vec2 u_resolution;
      uniform float u_time;
      uniform vec2 u_mouse;
      uniform float u_intensity;
      uniform float u_glow;

      // Simplex-like noise function
      vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
      vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
      vec3 permute(vec3 x) { return mod289(((x*34.0)+1.0)*x); }

      float snoise(vec2 v) {
        const vec4 C = vec4(0.211324865405187,  // (3.0-sqrt(3.0))/6.0
                            0.366025403784439,  // 0.5*(sqrt(3.0)-1.0)
                           -0.577350269189626,  // -1.0 + 2.0 * C.x
                            0.024390243902439); // 1.0 / 41.0
        vec2 i  = floor(v + dot(v, C.yy));
        vec2 x0 = v -   i + dot(i, C.xx);
        vec2 i1;
        i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
        vec4 x12 = x0.xyxy + C.xxzz;
        x12.xy -= i1;
        i = mod289(i);
        vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 ))
              + i.x + vec3(0.0, i1.x, 1.0 ));
        vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
        m = m*m ;
        m = m*m ;
        vec3 x = 2.0 * fract(p * C.www) - 1.0;
        vec3 h = abs(x) - 0.5;
        vec3 ox = floor(x + 0.5);
        vec3 a0 = x - ox;
        m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );
        vec3 g;
        g.x  = a0.x  * x0.x  + h.x  * x0.y;
        g.yz = a0.yz * x12.xz + h.yz * x12.yw;
        return 130.0 * dot(m, g);
      }

      // Spectral prism dispersion function
      vec3 spectrum(float n) {
        return max(vec3(0.0), vec3(
          sin(n * 6.28318 + 0.0) * 0.5 + 0.5,
          sin(n * 6.28318 + 2.094) * 0.5 + 0.5,
          sin(n * 6.28318 + 4.188) * 0.5 + 0.5
        ));
      }

      void main() {
        vec2 uv = gl_FragCoord.xy / u_resolution.xy;
        vec2 p = (gl_FragCoord.xy - 0.5 * u_resolution.xy) / min(u_resolution.x, u_resolution.y);

        // Center origin with mouse influence
        vec2 mouseOffset = (u_mouse - 0.5) * 0.35;
        vec2 prismCenter = vec2(0.0, 0.05) + mouseOffset;
        vec2 relP = p - prismCenter;

        float r = length(relP);
        float angle = atan(relP.y, relP.x);

        // Animated angular refraction
        float t = u_time * 0.25;
        float noiseVal = snoise(vec2(angle * 2.5 + t, r * 1.5 - t * 0.5));
        
        // Multi-frequency light rays
        float ray1 = sin(angle * 6.0 + t * 1.5 + noiseVal * 1.2) * 0.5 + 0.5;
        float ray2 = sin(angle * 12.0 - t * 2.0 + snoise(vec2(r * 3.0, angle * 4.0))) * 0.5 + 0.5;
        float ray3 = sin(angle * 3.0 + t * 0.8) * 0.5 + 0.5;

        // Combined ray strength
        float combinedRay = pow((ray1 * 0.6 + ray2 * 0.25 + ray3 * 0.4), 2.2);

        // Distance attenuation
        float falloff = 1.0 / (1.0 + r * 1.8 + r * r * 1.2);
        
        // Chromatic dispersion through refraction
        float dispR = angle / 6.28318 + t * 0.05 + 0.00;
        float dispG = angle / 6.28318 + t * 0.05 + 0.04 + noiseVal * 0.05;
        float dispB = angle / 6.28318 + t * 0.05 + 0.08 + noiseVal * 0.10;

        vec3 colR = spectrum(dispR) * vec3(1.0, 0.25, 0.3);
        vec3 colG = spectrum(dispG) * vec3(0.2, 0.95, 0.6);
        vec3 colB = spectrum(dispB) * vec3(0.3, 0.5, 1.0);
        
        vec3 prismColor = (colR + colG + colB) / 2.0;

        // Central crystalline prism glow
        float coreGlow = 0.08 / (r + 0.05) * u_glow;
        vec3 coreColor = vec3(0.9, 0.95, 1.0) * coreGlow;

        // Final composite
        vec3 finalColor = (prismColor * combinedRay * 1.8 + coreColor) * falloff * u_intensity;

        // Background subtle twilight dark base
        vec3 bg = mix(vec3(0.04, 0.07, 0.14), vec3(0.01, 0.02, 0.05), uv.y + r * 0.4);
        finalColor += bg;

        // Vignette
        float vignette = 1.0 - smoothstep(0.4, 1.3, r);
        finalColor *= vignette;

        gl_FragColor = vec4(finalColor, 1.0);
      }
    `;

    const createShader = (type: number, source: string) => {
      const shader = gl.createShader(type);
      if (!shader) return null;
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        gl.deleteShader(shader);
        return null;
      }
      return shader;
    };

    const vertexShader = createShader(gl.VERTEX_SHADER, vertexShaderSource);
    const fragmentShader = createShader(gl.FRAGMENT_SHADER, fragmentShaderSource);

    if (!vertexShader || !fragmentShader) return;

    const program = gl.createProgram();
    if (!program) return;

    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      return;
    }

    gl.useProgram(program);

    // Full screen quad geometry
    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([
        -1.0, -1.0,
         1.0, -1.0,
        -1.0,  1.0,
        -1.0,  1.0,
         1.0, -1.0,
         1.0,  1.0,
      ]),
      gl.STATIC_DRAW
    );

    const aPositionLocation = gl.getAttribLocation(program, 'a_position');
    gl.enableVertexAttribArray(aPositionLocation);
    gl.vertexAttribPointer(aPositionLocation, 2, gl.FLOAT, false, 0, 0);

    // Uniform locations
    const uResolutionLocation = gl.getUniformLocation(program, 'u_resolution');
    const uTimeLocation = gl.getUniformLocation(program, 'u_time');
    const uMouseLocation = gl.getUniformLocation(program, 'u_mouse');
    const uIntensityLocation = gl.getUniformLocation(program, 'u_intensity');
    const uGlowLocation = gl.getUniformLocation(program, 'u_glow');

    let animationFrameId: number;
    let startTime = performance.now();

    const resize = () => {
      if (!canvas) return;
      const displayWidth = canvas.parentElement?.clientWidth || window.innerWidth;
      const displayHeight = canvas.parentElement?.clientHeight || window.innerHeight;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);

      if (canvas.width !== displayWidth * dpr || canvas.height !== displayHeight * dpr) {
        canvas.width = displayWidth * dpr;
        canvas.height = displayHeight * dpr;
        gl.viewport(0, 0, canvas.width, canvas.height);
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!interactive) return;
      const rect = canvas.getBoundingClientRect();
      const clientX = e.clientX - rect.left;
      const clientY = e.clientY - rect.top;
      mouseRef.current.targetX = clientX / rect.width;
      mouseRef.current.targetY = 1.0 - clientY / rect.height;
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('resize', resize);
    resize();

    const render = (now: number) => {
      const elapsed = (now - startTime) * 0.001 * speed;

      // Smooth mouse interpolation
      mouseRef.current.x += (mouseRef.current.targetX - mouseRef.current.x) * 0.05;
      mouseRef.current.y += (mouseRef.current.targetY - mouseRef.current.y) * 0.05;

      gl.useProgram(program);
      gl.uniform2f(uResolutionLocation, canvas.width, canvas.height);
      gl.uniform1f(uTimeLocation, elapsed);
      gl.uniform2f(uMouseLocation, mouseRef.current.x, mouseRef.current.y);
      gl.uniform1f(uIntensityLocation, intensity);
      gl.uniform1f(uGlowLocation, glow);

      gl.drawArrays(gl.TRIANGLES, 0, 6);

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
      if (gl) {
        gl.deleteProgram(program);
        gl.deleteShader(vertexShader);
        gl.deleteShader(fragmentShader);
        gl.deleteBuffer(positionBuffer);
      }
    };
  }, [speed, intensity, glow, interactive]);

  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}>
      <canvas
        ref={canvasRef}
        className="w-full h-full block"
        style={{ width: '100%', height: '100%' }}
      />
      {/* Subtle iridescent noise/grid overlay */}
      <div
        className="absolute inset-0 bg-radial from-transparent via-slate-950/30 to-slate-950/80 mix-blend-multiply pointer-events-none"
      />
    </div>
  );
}
