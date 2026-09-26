import React from 'react';
import { Sidebar } from './Sidebar';
import { TopHeader } from './TopHeader';

export { Sidebar, TopHeader };

export function Navbar(props) {
  // Backwards compatibility layer
  return <Sidebar {...props} />;
}
