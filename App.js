import React, { PureComponent, Component } from 'react';
import {
	ActivityIndicator,
	Dimensions,
	StyleSheet,
	Text,
	TextInput,
	View,
	FlatList,
	SearchBar,
	Spacer
} from 'react-native';
import { 
	ListItem, 
	Divider,
	Header,
	Button
} from 'react-native-elements'
import * as firebase from 'firebase';

const firebaseConfig = {
	//databaseURL: "https://expo-56d88.firebaseio.com",
	databaseURL: "https://web-js-4f962.firebaseio.com"
};

firebase.initializeApp(firebaseConfig);

export default class App extends Component {
	state = {
		key:'',
		bird_name: '',
		bird_owner: '',
		listOwner: [],
		loading: false,
	}
  
	componentWillMount() {
		let initialLoad = true;
		this.setState({loading: true});
	
		firebase.database().ref().child('example').on('value', (snapshot) => {
			var listOwner = []
			snapshot.forEach(item => {
				listOwner.push({
					key:item.key,
					bird_owner:item.val().bird_owner,
					bird_name:item.val().bird_name
				});
			});
			
			this.setState({
				listOwner: listOwner
			});

			if (initialLoad) {
				this.setState({loading: false});
				initialLoad = false;
			}
		});
	}
	
	renderListItem = ({ item }) => (
		<ListItem
            title={item.bird_name}
            subtitle={item.bird_owner}
            leftAvatar={{ source: { uri: item.avatar_url } }}
			onPress={() => this._selectValue(item.key)}
		/>
	);
	
	render() {
		return (
		<View>
			<View>
				<Header
					leftComponent={{ icon: 'menu', color: '#fff' }}
					centerComponent={{ text: 'KICAU', style: { color: '#fff' } }}
					//rightComponent={{ icon: 'home', color: '#fff' }}
					containerStyle={{
						backgroundColor: '#7FBD2C',
						justifyContent: 'space-around',
					}}
				/>
				
				<TextInput
					onChangeText={bird_name => { this.setState({bird_name}) }}
					onSubmitEditing={this._saveValue}
					value={this.state.bird_name}
					style={styles.textInput}
					placeholder={'Nama Burung'}
				/>
				
				<TextInput
					onChangeText={bird_owner => { this.setState({bird_owner}) }}
					onSubmitEditing={this._saveValue}
					value={this.state.bird_owner}
					style={styles.textInput}
					placeholder={'Nama Pemilik'}
				/>
				
				<View style={{
					flexDirection: 'row',
					justifyContent: 'space-between',
					height: 30
				}}>
					<View style={{flexDirection: 'column',justifyContent: 'center'}}>
						<Button
							onPress={this._saveValue}
							title="Simpan"
						/>
					</View>
					<View style={{flexDirection: 'column',justifyContent: 'center'}}>
						<Button
							onPress={this._cancelValue}
							title="Batalkan"
						/>
					</View>
					<View style={{flexDirection: 'column',justifyContent: 'center'}}>
						<Button
							onPress={this._deleteValue}
							title="Hapus"
						/>
					</View>
				</View>
				
				<FlatList
					data={this.state.listOwner}
					renderItem={this.renderListItem}
				/>
			</View>
			{this._maybeRenderLoadingOverlay()}
		</View>
		);
	}
  
	_saveValue = async () => {
		try {
			this.setState({loading: true});
			if (this.state.key == ''){ //insert
				await firebase.database().ref('example').push({ 
					bird_name: this.state.bird_name,
					bird_owner: this.state.bird_owner,	
				});
			}else{ //update
				await firebase.database().ref('example').child(this.state.key).update({ 
					bird_name: this.state.bird_name,
					bird_owner: this.state.bird_owner,	
				});
			}
		} catch(e) {
		  // Error! oh no
		} finally {
			this.setState({
				loading: false,
				bird_name: '',
				bird_owner: ''
			});
		}
	}
	
	_cancelValue = async () => {
		this.setState({
				loading: false,
				key: '',
				bird_name: '',
				bird_owner: ''
		});
	}
	
	_selectValue = async (key) => {
		try {
			this.setState({loading: true});
			await firebase.database().ref('example').child(key).once('value', (item) => {
				this.setState({
					loading: false,
					key: key,
					bird_owner:item.val().bird_owner,
					bird_name:item.val().bird_name
				});
			});		
		} catch(e) {
		  // Error! oh no
		} finally{
			this.setState({loading: false});
		}
	}
	
	_deleteValue = async () => {
		try {
			this.setState({loading: true});
			await firebase.database().ref('example').child(this.state.key).remove();
			this.setState({
				loading: false,
				key: '',
				bird_owner: '',
				bird_name: ''
			});
		} catch(e) {
		  // Error! oh no
		}finally{
			this.setState({loading: false});
		}
	}

	_maybeRenderLoadingOverlay = () => {
		if (this.state.loading) {
		  return (
			<View style={[StyleSheet.absoluteFill, styles.loadingOverlay]}>
			  <ActivityIndicator
				color="#fff"
				animating
				size="large"
			  />
			</View>
		  );
		}
	}
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		alignItems: 'center',
		justifyContent: 'center',
		position: 'absolute'
	},
	title: {
		fontSize: 20,
	},
	textInput: {
		width: Dimensions.get('window').width - 30,
		marginHorizontal: 15,
		padding: 5,
		borderRadius: 2,
		borderWidth: 1,
		borderColor: '#eee',
		marginVertical: 15,
		height: 50,
		fontSize: 16,
	},
	loadingOverlay: {
		backgroundColor: 'rgba(0,0,0,0.4)',
		alignItems: 'center',
		justifyContent: 'center',
	}
});