import React from 'react'
import { NavLink } from 'react-router-dom'

export default function NavBar() {
  return (
    <nav style={{
      position: 'fixed',
      bottom: 0,
      width: '100%',
      display: 'flex',
      background: '#0E0B1D',
      padding: '10px 20px',
      justifyContent: 'space-around',
      boxShadow: '0 -1px 5px rgba(0,0,0,0.5)'
    }}>
      <NavLink to="/home"     style={({isActive})=>({color: isActive?'#004EFF':'#AAA', textDecoration:'none'})}>Home</NavLink>
      <NavLink to="/cards"    style={({isActive})=>({color: isActive?'#004EFF':'#AAA', textDecoration:'none'})}>My Cards</NavLink>
      <NavLink to="/stats"    style={({isActive})=>({color: isActive?'#004EFF':'#AAA', textDecoration:'none'})}>Statistics</NavLink>
      <NavLink to="/settings" style={({isActive})=>({color: isActive?'#004EFF':'#AAA', textDecoration:'none'})}>Settings</NavLink>
    </nav>
  )
}

