import { Ref } from "react";

let topLoaderRef: Ref<any>  = null;
function setTopLoaderRef(value: Ref<any> ) {
  topLoaderRef = value;
}

function getTopLoaderRef() {
  return topLoaderRef;
}

export default {
  setTopLoaderRef,
  getTopLoaderRef,
};
