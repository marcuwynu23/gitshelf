export function Button(props: any) {
  return <button className={`${props.className}`}>{props.children}</button>;
}
