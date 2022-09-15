import React, { Component } from 'react';
import Identicon from 'identicon.js';
import photo from '../photo.png'
class Navbar extends Component {

  render() {
    return (
      <nav className="navbar navbar-dark fixed-top bg-dark flex-md-nowrap p-0 shadow">
        <a>
          <img src={photo} width="30" height="30" className="d-inline-block align-top" alt="" />
          <huge className="text-secondary">
              <huge id="title"><b>Social media with blockchain</b></huge>
            </huge>
        </a>
        <ul className="navbar-nav px-3">
          <li className="nav-item text-nowrap d-none d-sm-none d-sm-block">
            <small className="text-secondary">
              <small id="account">{this.props.account}</small>
            </small>
            { this.props.account
              ? <img
                className='ml-2'
                width='30'
                height='30'
                src={`data:image/png;base64,${new Identicon(this.props.account, 30).toString()}`}
              />
              : <span></span>
            }
          </li>
        </ul>
      </nav>
    );
  }
}

export default Navbar;