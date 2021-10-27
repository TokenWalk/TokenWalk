import {FunctionComponent, ReactElement, useRef} from "react"
import useClickOutside from "../../hooks/useClickOutside"
import {ReactComponent as ArrowDown} from "../../assets/icons/arrow-down.svg"
import "./styles.scss"

const Dropdown: FunctionComponent<{
	open: boolean
	items: {id: string; content: ReactElement | string}[]
	triggerText: string
	onClose: () => void
	onTriggerClick: () => void
	onItemClick?: (itemId: string) => void
	borders?: "all" | "none"
}> = ({open, onClose, items, onTriggerClick, onItemClick, triggerText, borders = "all"}) => {
	const ref = useRef<HTMLDivElement | null>(null)
	useClickOutside(ref, onClose)
	const handleItemClick = (id: string) => {
		onItemClick && onItemClick(id)
		onClose()
	}

	return (
		<div className="dropdown" ref={ref}>
			<ul className={`dropdown__content dropdown__content--borders-${borders}`}>
				<li className="dropdown__trigger" onClick={onTriggerClick}>
					{triggerText}
					<ArrowDown
						className={`dropdown__arrow ${open ? "dropdown__arrow--open" : ""}`}
						width="20px"
						height="20px"
					/>
				</li>
				{open &&
					items.map(({id, content}) => (
						<li key={id} onClick={() => handleItemClick(id)} className="dropdown__item">
							{content}
						</li>
					))}
			</ul>
		</div>
	)
}

export default Dropdown