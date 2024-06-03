import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { useCalibrateSoil } from '@/context/calibrateSoil'
import { Textarea } from '@/components/ui/textarea'
import { useEffect, useRef, useState } from 'react'
import { useSocket } from '@/context/sockets'

const CalibrateSoilSensor = () => {
    const { dialogOpen, closeCalibrateDialog, sensor } = useCalibrateSoil()
    const [calibrationText, setCalibrationText] = useState('')
    const { socket } = useSocket()
    const textareaRef = useRef<HTMLTextAreaElement>(null)

    useEffect(() => {
        if (dialogOpen && sensor) {
            sensor && socket.emit('calibrateMoisSensor', sensor)
        }

        socket.on('calibrationMessage', (data) => {
            if (data === 'Done') {
                setTimeout(() => {
                    setCalibrationText('')
                    closeCalibrateDialog()
                }, 2000)
            }

            setCalibrationText((prev) => `${prev} \n ${data} `)
        })

        return () => {
            socket.off('calibrationMessage')
        }

        // eslint-disable-next-line
    }, [dialogOpen, sensor])

    // auto scroll
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.scrollTop = textareaRef.current.scrollHeight
        }
    }, [calibrationText])

    return (
        <Dialog
            open={dialogOpen}
            onOpenChange={(e) => e === false && closeCalibrateDialog()}
        >
            <DialogContent className=" h-[500px]">
                <DialogHeader className="flex">
                    <DialogTitle>Calibrating Sensor {sensor}</DialogTitle>
                    <DialogDescription>
                        <Textarea
                            ref={textareaRef}
                            value={calibrationText}
                            className=" h-[425px] overflow-y-auto"
                            style={{ scrollBehavior: 'smooth' }}
                            readOnly
                        />
                    </DialogDescription>
                </DialogHeader>
            </DialogContent>
        </Dialog>
    )
}

export default CalibrateSoilSensor
