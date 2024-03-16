import './Info.css'

const image1 = "https://nutriciously.com/wp-content/uploads/2016/07/Cook-Without-Oil-Featured-Image-735x491.jpg"
const image2 = "https://t4.ftcdn.net/jpg/03/32/75/39/360_F_332753934_tBacXEgxnVplFBRyKbCif49jh0Wz89ns.jpg"
const DEFAULT_IMAGE = process.env.REACT_APP_DEFAULT_IMAGE

const useImage = Boolean(Number(process.env.REACT_APP_USE_IMAGES))

const Info = () => {
  return (
    <main className='info-page'>
      <h2 className='top'>Info</h2>
      <section className='col1 row1'>
        <p>Nisi ex elit excepteur voluptate dolore. Pariatur qui cillum eu consectetur cupidatat laboris qui consequat. Et deserunt aliqua do qui officia aliquip mollit. Do ipsum ipsum exercitation reprehenderit.</p>
        <p>Do cillum non enim ea aliqua pariatur. Aliquip ut velit ut ex ad. Occaecat fugiat consequat amet aliqua officia. Aute in commodo occaecat ex non. Adipisicing duis veniam commodo Lorem consequat aute et aliquip mollit deserunt elit aute et officia.</p>
        <p>Sunt ex irure aliquip ut reprehenderit ad ex. Ipsum ea ipsum id cupidatat. Laboris laboris velit fugiat ex aute amet laboris laboris proident tempor laborum esse in ullamco.</p>
        <p>Enim dolore occaecat proident incididunt irure officia reprehenderit consequat eiusmod. Sunt tempor ut culpa eu voluptate minim qui. Nisi pariatur laboris ipsum do in esse commodo eiusmod consequat fugiat. Nulla ex reprehenderit eiusmod minim do excepteur. Dolore voluptate deserunt deserunt adipisicing Lorem sint culpa labore eu velit exercitation. Aute magna culpa tempor ipsum anim est culpa laboris irure.</p>
      </section>
      <img className='col2 row1 image' width='500' src={useImage ? image1 : DEFAULT_IMAGE} alt='Chopping Board with ingredients'/>
      <section className='col2 row2'>
        <p>Occaecat non et pariatur nisi do do aliqua esse. Fugiat mollit laboris in mollit anim sint ea duis est enim id laborum. Irure et cillum ipsum officia Lorem amet voluptate mollit id ad aliqua quis minim. Nisi quis excepteur minim qui mollit dolor deserunt velit ea.</p>
        <p>Mollit Lorem quis ut cupidatat dolore consequat cupidatat qui nulla. Cillum culpa consequat ad sit veniam anim consectetur mollit amet. Amet Lorem amet excepteur consectetur. Eu ad ipsum dolor tempor et quis occaecat voluptate veniam sint. Proident veniam dolore aute proident incididunt nostrud aliquip. Incididunt minim aliquip minim magna non sit nisi velit culpa ea duis.</p>
        <p>Nisi adipisicing exercitation culpa sint esse voluptate tempor consequat elit ea aute occaecat occaecat. Quis cupidatat aute culpa eu exercitation cupidatat id reprehenderit incididunt eiusmod. Culpa do in exercitation deserunt excepteur consectetur culpa. Laboris laboris minim ipsum proident proident ullamco cupidatat magna sunt voluptate cillum. Dolor tempor duis ea labore esse.</p>
      </section>
      <img className='col1 row2 image' width='500' src={useImage ? image2 : DEFAULT_IMAGE} alt='Chopping Board with ingredients'/>
      <section className='bottom'>
        <p>Veniam sit ullamco proident ea nisi in et ad aliqua. Deserunt commodo consequat et cillum. Et ipsum deserunt laboris adipisicing est enim amet Lorem nulla sint quis labore. Aliqua sunt adipisicing sint fugiat id minim sint officia. Sint Lorem laboris exercitation voluptate sunt magna. Quis ad cupidatat elit duis anim ipsum esse.</p>
        <p>Aute cupidatat incididunt dolore magna qui ea ea tempor ex sint. Lorem in mollit incididunt aliquip anim. Officia anim quis minim deserunt. Dolor dolore incididunt mollit consequat magna et sit voluptate commodo ullamco. Est incididunt aliquip laborum irure ullamco anim aliquip mollit ea enim et.</p>
        <p>Et laboris incididunt id do sint sit est cupidatat in ipsum. Amet officia consequat cillum adipisicing ex aliquip qui Lorem nulla nostrud proident. Magna officia officia amet deserunt voluptate. Pariatur commodo officia velit sint nostrud eiusmod voluptate et dolor mollit proident nostrud tempor proident. Et nulla labore irure enim ex est voluptate labore cupidatat exercitation do exercitation. Tempor proident nulla dolore officia magna ea commodo esse tempor. Irure fugiat eu ut nulla tempor dolore anim excepteur.</p>
      </section>
      </main>
  )
}

export default Info