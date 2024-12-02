import ActionBar from './components/ActionBar'
import ProjectListContent from './components/ProjectListContent'
import NewProjectDialog from './components/NewProjectDialog'
import Container from '@/components/shared/Container'

const ClubList = () => {
    return (
        <Container className="h-full">
            {/* <ActionBar /> */}
            <ProjectListContent />
            {/* <NewProjectDialog /> */}
        </Container>
    )
}

export default ClubList
