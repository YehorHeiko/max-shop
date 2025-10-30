import { useEffect, useRef } from "react";

export function usePrevious(props: number) {
  const ref = useRef(0);

  console.log(ref.current);

  //   if (props > ref.current) {
  //     ref.current = props;
  //   }

  useEffect(() => {
    ref.current = props;
  }, [props]);

  return ref.current;
}
