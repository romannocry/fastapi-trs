import React, { useState, useEffect, useRef } from 'react';


export let prod = false;
export let appURL = prod ? 'http://app:3000' : 'http://localhost:3000' ;
export let apiURL = prod ? 'http://api:8000' : 'http://localhost:8000' ;
export let wsURL = prod ? 'ws://api:8000' : 'ws://localhost:8000' ;