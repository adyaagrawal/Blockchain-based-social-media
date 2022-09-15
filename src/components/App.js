import React, { Component } from 'react';
import Web3 from 'web3';
import './App.css';
import Decentragram from '../abis/Decentragram.json'
import Navbar from './Navbar'
import Main from './Main'
import { Buffer } from 'buffer';

const ipfsClient = require('ipfs-http-client')
const projectId = '2DqEHwJRqLo9i7VdPH9Z2cYCz3J'
const projectSecret = '57b2cd0ebc64ccfff903a987f86c06b0'

class App extends Component {

  async componentWillMount() {
    await this.loadWeb3()
    await this.loadBlockchainData()
  }

  async loadWeb3() {
    if (window.ethereum) {
      window.web3 = new Web3(window.ethereum)
      await window.ethereum.enable()
    }
    else if (window.web3) {
      window.web3 = new Web3(window.web3.currentProvider)
    }
    else {
      window.alert('Non-Ethereum browser detected. You should consider trying MetaMask!')
    }
  }

  async loadBlockchainData() {
    const web3 = window.web3
    // Load account
    const accounts = await web3.eth.getAccounts()
    console.log(accounts)
    this.setState({ account: accounts[0] })
    // Network ID
    const networkId = await web3.eth.net.getId()
    const networkData = Decentragram.networks[networkId]
    if(networkData) {
      const decentragram = new web3.eth.Contract(Decentragram.abi, networkData.address)
      this.setState({ decentragram })
      const imagesCount = await decentragram.methods.imageCount().call()
      this.setState({ imagesCount })
      //Load images
      for (var i = 1; i <= imagesCount; i++) {
        const image = await decentragram.methods.images(i).call()
        this.setState({
          images: [...this.state.images, image]
        })
      }
      // Sort images. Show highest tipped images first
      this.setState({
        images: this.state.images.sort((a,b) => b.tipAmount - a.tipAmount )
      })
      this.setState({ loading: false})
    } else {
      window.alert('Decentragram contract not deployed to detected network.')
    }
  }


  captureFile = event => {

    event.preventDefault()
    const file = event.target.files[0]
    const reader = new window.FileReader()
    reader.readAsArrayBuffer(file)

    reader.onloadend = () => {
      this.setState({ buffer: Buffer(reader.result) })
      console.log('buffer', this.state.buffer)
    }
  }

  tipImageOwner(id, tipAmount) {
    this.setState({ loading: true })
    this.state.decentragram.methods.tipImageOwner(id).send({ from: this.state.account, value: tipAmount }).on('transactionHash', (hash) => {
      this.setState({ loading: false })
    })
  }

  uploadImage = description => {
    console.log("Submitting file to ipfs...")
    const buffer=this.state.buffer
    var file;
    async function upload() {
      console.log("Submitting file to ipfs...")
      const auth = 'Basic ' + Buffer.from(projectId + ':' + projectSecret).toString('base64');
      
       const client = await ipfsClient.create({
          host: 'ipfs.infura.io',
          port: 5001,
          protocol: 'https',
          apiPath: '/api/v0',
          headers: {
            authorization: auth
          }
        })
      
      try {
          file = await client.add(buffer)
          console.log(file)
          console.log(file.path)
          console.log(typeof file.path);
          return file
      
          } catch (error) {
            console.log(error)
          }
      
      }
      const promise = upload();
      promise.then((data) => {
        console.log(data.path);
        this.setState({ loading: true })
        this.state.decentragram.methods.uploadImage(String(data.path), description).send({ from: this.state.account }).on('transactionHash', (path) => {
        this.setState({ loading: false })
      })
      })
  }

  constructor(props) {
    super(props)
    this.state = {
      account: '',
      decentragram: null,
      images: [],
      loading: true
    }

    this.uploadImage = this.uploadImage.bind(this)
    this.tipImageOwner = this.tipImageOwner.bind(this)
    this.captureFile = this.captureFile.bind(this)
  }

  render() {
    return (
      <div>
        <Navbar account={this.state.account} />
        { this.state.loading
          ? <div id="loader" className="text-center mt-5"><p>Loading...</p></div>
          : <Main
                images={this.state.images}
                captureFile={this.captureFile}
                uploadImage={this.uploadImage}
                tipImageOwner={this.tipImageOwner}
            />
          }
        }
      </div>
    );
  }
}

export default App;