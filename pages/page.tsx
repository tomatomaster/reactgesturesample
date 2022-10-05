import { useDrag } from "@use-gesture/react";
import { useCallback, useEffect, useRef, useState } from "react";
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
    const { ref, style } = useOriginalGesture();

    const calStart = useCallback((_e: TouchEvent) => {
        const timerId = window.setTimeout(() => {
            console.log('longPress!!')
            setShowContext(true);
        }, 1500);
        console.log(`Click ${timer.current}`);
        timer.current.push(timerId);
        setTouchedPosition([_e.touches[0].clientX, _e.touches[0].clientY]);
    }, []);

    const calEnd = useCallback((_e: TouchEvent) => {
        console.log(timer);
        timer.current.forEach(timer => {
            console.log(`Clear ${timer}`);
            window.clearTimeout(timer);
        })
        timer.current = new Array();
    }, []);

    useEffect(() => {
        setWidth(window.innerWidth);
        window.addEventListener('touchmove', a);
        window.addEventListener('touchstart', calStart);
        window.addEventListener('touchend', calEnd);
        return () => {
            window.removeEventListener('touchmove', a);
            window.removeEventListener('touchstart', calStart);
            window.removeEventListener('touchend', calEnd);
        }
    }, [calStart, calEnd]);

    const a = (e: TouchEvent) => {
        console.log(`X ${e.touches[0].radiusX} ${e.touches[0].radiusY}`);
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
                    <MenuItem>
                        <ListItemIcon onClick={() => { setShowContext(false) }}>
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