import { View } from 'react-native'
import ogImage from 'src/cambio/cambio-og.jpg'
import Cover from 'src/cambio/Cover'
import Creed from 'src/cambio/Creed'
import Footer from 'src/cambio/Footer'
import Incarnation from 'src/cambio/Incarnation'
import Intro from 'src/cambio/Intro'
import Myth from 'src/cambio/Myth'
import OpenGraph from 'src/header/OpenGraph'
import Invitation from './Invitation'

export default function Cambio() {
  return (
    <View>
      <OpenGraph title="Câmbio" description="The Sacred Gift" path="/cambio" image={ogImage} />
      <View>
        <Cover />
        <Intro />
        <Myth />
        <Creed />
        <Incarnation />
        <Invitation />
        <Footer />
      </View>
    </View>
  )
}
