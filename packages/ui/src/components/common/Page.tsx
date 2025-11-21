export function Page(props: any) {
  return (
    <div className={props.className} id={props.id}>
      {props.children}
    </div>
  );
}
