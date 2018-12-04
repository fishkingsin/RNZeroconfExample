/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

import React, { Component } from 'react'
import { Platform, StyleSheet, Text, View, FlatList, RefreshControl} from 'react-native'
import Zeroconf from 'react-native-zeroconf'
import _ from 'lodash'
import { List, ListItem } from 'react-native-elements'

const zeroconf = new Zeroconf()

export default class App extends Component {

  constructor (props) {
    super(props)
    // this.ds =
    this.state = {
      serviceState: '',
      services: []
    }

    this.refreshData = this.refreshData.bind(this)

    zeroconf.scan('http', 'tcp', 'local.')
    zeroconf.on('start', () => {
      this.setState({ serviceState: 'start' })
      console.log('The scan has started.')
    })
    zeroconf.on('stop', () => {
      this.setState({ serviceState: 'stop' })
      console.log('The scan has stop.')
    })
    zeroconf.on('resolved', (service) => {
      // this.setState({ serviceState: 'The scan has started.' })
      this.setState({ services: _.uniqBy(_.concat(this.state.services, service), 'name'), serviceState: 'resolved' })
      console.log('The scan has resolved.', JSON.stringify(service, null , 2))
    })
    zeroconf.on('error', () => {
      this.setState({ serviceState: 'error' })
      console.log('The scan has error.')
    })

    this.timeout = setTimeout(() => {
      zeroconf.stop()
      clearTimeout(this.timeout)
    }, 5000)
  }
  renderRow ({item, index}) {
    return (
      <ListItem key={`key_${item.name}`} title={`${item.name}`} subtitle={JSON.stringify(item.txt, null , 2)} />
    )
  }
  refreshData () {
	if (this.state.serviceState === 'start') return
	this.setState({ services: [] });
	zeroconf.scan('http', 'tcp', 'local.');
	clearTimeout(this.timeout)
	this.timeout = setTimeout(() => {
		zeroconf.stop()
		clearTimeout(this.timeout)
	}, 5000)
  }

  render () {
    return (
      <View style={styles.container}>
        <Text style={styles.welcome}>
          {this.state.serviceState}
        </Text>
        <FlatList
          data={this.state.services}
		  renderItem={this.renderRow}
		  keyExtractor={(item) => `key_${item.name}`}
		  refreshControl={
			  <RefreshControl
			  	refreshing={this.state.serviceState === 'start'}
				onRefresh={this.refreshData}
				title=""
				tintColor="skyblue"
				/>
			}
		/>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5FCFF'
  },
  list: {
    flex: 1
  },
  welcome: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10
  },
  instructions: {
    textAlign: 'center',
    color: '#333333',
    marginBottom: 5
  }
})
