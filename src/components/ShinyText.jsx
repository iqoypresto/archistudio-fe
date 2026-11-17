/**
 * @param {{
 *   text?: import('react').ReactNode,
 *   children?: import('react').ReactNode,
 *   color?: string,
 *   shineColor?: string,
 *   speed?: number,
 *   shineWidth?: number,
 *   glow?: number,
 *   direction?: 'left' | 'right',
 *   className?: string,
 *   style?: import('react').CSSProperties
 * }} props
 */
export default function ShinyText({
  text,
  children,
  color = "#b5b5b5",
  shineColor = "#ffffff",
  speed = 2.8,
  shineWidth = 100,
  glow = 0.2,
  direction = "right",
  className = "",
  style = {},
}) {
  const content = children ?? text;
  /** @type {import('react').CSSProperties & {
   *  '--shiny-text-color': string,
   *  '--shiny-text-shine-color': string,
   *  '--shiny-text-speed': string,
   *  '--shiny-text-band': string,
   *  '--shiny-text-glow': string,
   *  '--shiny-text-direction': string
   * }}
   */
  const animationStyle = {
    "--shiny-text-color": color,
    "--shiny-text-shine-color": shineColor,
    "--shiny-text-speed": `${Math.max(0.1, speed)}s`,
    "--shiny-text-band": `${Math.min(32, Math.max(2, shineWidth * 0.16))}%`,
    "--shiny-text-glow": String(Math.min(1, Math.max(0, glow))),
    "--shiny-text-direction": direction === "left" ? "reverse" : "normal",
    ...style,
  };

  return (
    <span className={`shiny-text ${className}`} style={animationStyle}>
      <span className="shiny-text__layer">{content}</span>
      <span className="shiny-text__glow" aria-hidden="true">
        {content}
      </span>
    </span>
  );
}
