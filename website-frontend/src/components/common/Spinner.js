import { HashLoader } from "react-spinners"
const Spinner = ({ className, size }) => {
  const loadsize = size || '60px'
  if (className) {
    return (
      <HashLoader size={loadsize} className={className} cssOverride={{margin: "10px"}}/>
    )
  }
  return (
    <HashLoader size={loadsize} cssOverride={{margin: "10px"}}/>
  )
}

export default Spinner