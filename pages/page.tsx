import { useDrag } from "@use-gesture/react";
import { MutableRefObject, useCallback, useEffect, useRef, useState } from "react";
import { animated, useSpring, useSprings } from "react-spring";
import Divider from '@mui/material/Divider';
import Paper from '@mui/material/Paper';
import MenuList from '@mui/material/MenuList';
import MenuItem from '@mui/material/MenuItem';
import ListItemText from '@mui/material/ListItemText';
import ListItemIcon from '@mui/material/ListItemIcon';
import Typography from '@mui/material/Typography';
import ContentCut from '@mui/icons-material/ContentCut';
import ContentCopy from '@mui/icons-material/ContentCopy';
import ContentPaste from '@mui/icons-material/ContentPaste';
import Cloud from '@mui/icons-material/Cloud';
import styles from './styles.module.css'
import { display, positions } from "@mui/system";
import { useOriginalGesture } from "../src/gesture"

export const Page = () => {

    const pages = [
        'https://images.pexels.com/photos/62689/pexels-photo-62689.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260',
        'https://images.pexels.com/photos/733853/pexels-photo-733853.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260',
        'https://images.pexels.com/photos/4016596/pexels-photo-4016596.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260',
        'https://images.pexels.com/photos/351265/pexels-photo-351265.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260',
        'https://images.pexels.com/photos/924675/pexels-photo-924675.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260',
    ]
    const index = useRef(0);
    const [width, setWidth] = useState<number>(0);
    const [showContext, setShowContext] = useState<boolean>(false);
    const [touchedPosition, setTouchedPosition] = useState<[number, number]>([0, 0]);
    const timer = useRef<Array<number>>(new Array());
    const [enableGesture, setEnableGesture] = useState(false);
    const [gestureDelta, setGestureDelta] = useState(0.03);
    const { ref, style } = useOriginalGesture();


    const gestureModeEnable = useCallback((e: TouchEvent) => {
        for (let i = 0; i < e.touches.length; i++) {
            if (width * (gestureDelta / 1000) < e.touches[i].radiusX) {
                setEnableGesture(true);
            } else {
                setEnableGesture(false);
            }
        }
    }, [gestureDelta]);

    const touchStartHandler = useCallback((event: TouchEvent) => {
        const timerId = window.setTimeout(showContextMenue, 1500);
        timer.current.push(timerId);
        if (!showContext) {
            setTouchedPosition([event.touches[0].clientX, event.touches[0].clientY]);
        }
        gestureModeEnable(event);
    }, [showContext, gestureModeEnable]);

    const touchEndHandler = useCallback((_e: TouchEvent) => {
        cancelTimeout(timer);
    }, []);

    const showContextMenue = useCallback(() => {
        setShowContext(true);
    }, [setShowContext]);

    useEffect(() => {
        setWidth(window.innerWidth);
        window.addEventListener('touchmove', touchMoveHandler);
        window.addEventListener('touchstart', touchStartHandler);
        window.addEventListener('touchend', touchEndHandler);
        return () => {
            window.removeEventListener('touchmove', touchMoveHandler);
            window.removeEventListener('touchstart', touchStartHandler);
            window.removeEventListener('touchend', touchEndHandler);
        }
    }, [touchStartHandler, touchEndHandler]);

    const touchMoveHandler = (e: TouchEvent) => {
        cancelTimeout(timer);
        console.log(`X ${e.touches[0].radiusX} ${e.touches[0].radiusY}`);
    }

    function cancelTimeout(timer: MutableRefObject<number[]>) {
        timer.current.forEach(timer => {
            window.clearTimeout(timer);
        });
        timer.current = new Array();
    }



    const [props, api] = useSprings(pages.length, i => ({
        x: i * width,
        scale: 1,
        display: 'block',
    }))
    const bind = useDrag(({ active, movement: [mx], direction: [xDir], cancel }) => {
        if (active && Math.abs(mx) > width / 2) {
            const pageMove = xDir > 0 ? -1 : 1;
            index.current = Math.min(Math.max(index.current + pageMove, 0), pages.length - 1);
            cancel();
        }
        api.start(i => {
            if (i < index.current - 1 || i > index.current + 1) return { display: 'none' }
            const x = (i - index.current) * width + (active ? mx : 0);
            const scale = active ? 1 - Math.abs(mx) / width / 2 : 1;
            return { x, scale, display: 'block' }
        })
    })

    return (
        <>
            <animated.div className={styles.card} ref={ref} style={style}></animated.div>
            <input value={gestureDelta} inputMode='numeric' onChange={(event) => setGestureDelta(Number(event.target.value))} />
            <text>Gesture: {enableGesture ? 'Enable' : 'Disable'}</text>
            <div style={{ display: showContext ? "block" : "none", position: 'fixed', left: `${touchedPosition[0]}px`, top: `${touchedPosition[1]}px` }}>
                <IconMenu></IconMenu>
            </div>
            <div className={styles.wrapper}>
                {
                    props.map(({ x, display, scale }, i) => (
                        <animated.div className={styles.page}  {...bind()} key={i} style={{ display }}>
                            <animated.div style={{ scale, backgroundImage: `url(${pages[i]})` }} />
                        </animated.div>
                    ))
                }
            </div >
        </>
    )


    function IconMenu() {
        return (
            <Paper sx={{ width: 320, maxWidth: '100%' }}>
                <MenuList>
                    <MenuItem onClick={() => { setShowContext(false) }}>
                        <ListItemIcon>
                            <ContentCut fontSize="small" />
                        </ListItemIcon>
                        <ListItemText>Cut</ListItemText>
                        <Typography variant="body2" color="text.secondary">
                            ⌘X
                        </Typography>
                    </MenuItem>
                    <MenuItem>
                        <ListItemIcon>
                            <ContentCopy fontSize="small" />
                        </ListItemIcon>
                        <ListItemText>Copy</ListItemText>
                        <Typography variant="body2" color="text.secondary">
                            ⌘C
                        </Typography>
                    </MenuItem>
                    <MenuItem>
                        <ListItemIcon>
                            <ContentPaste fontSize="small" />
                        </ListItemIcon>
                        <ListItemText>Paste</ListItemText>
                        <Typography variant="body2" color="text.secondary">
                            ⌘V
                        </Typography>
                    </MenuItem>
                    <Divider />
                    <MenuItem>
                        <ListItemIcon>
                            <Cloud fontSize="small" />
                        </ListItemIcon>
                        <ListItemText>Web Clipboard</ListItemText>
                    </MenuItem>
                </MenuList>
            </Paper>
        );
    }
}

export default Page


