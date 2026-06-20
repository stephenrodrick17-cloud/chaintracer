from typing import Dict, Any
from .collection_agent import CollectionAgent
from .analysis_agent import AnalysisAgent
from .verification_agent import VerificationAgent
from .reporting_agent import ReportingAgent


class AgentOrchestrator:
    """
    Orchestrates the multi-agent system workflow
    Collection → Analysis → Verification → Reporting
    """

    def __init__(self):
        self.collection_agent = CollectionAgent()
        self.analysis_agent = AnalysisAgent()
        self.verification_agent = VerificationAgent()
        self.reporting_agent = ReportingAgent()

    async def run_pipeline(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Run the complete fraud detection pipeline
        """
        results = {
            "pipeline_status": "in_progress",
            "steps": {}
        }

        try:
            # Step 1: Collection
            print("Step 1: Collecting data...")
            collection_result = await self.collection_agent.process(input_data)
            results["steps"]["collection"] = collection_result

            if collection_result["status"] != "success":
                results["pipeline_status"] = "failed"
                return results

            # Step 2: Analysis
            print("Step 2: Analyzing data...")
            analysis_input = {"collected_data": collection_result["collected_data"]}
            analysis_result = await self.analysis_agent.process(analysis_input)
            results["steps"]["analysis"] = analysis_result

            if analysis_result["status"] != "success":
                results["pipeline_status"] = "failed"
                return results

            # Step 3: Verification
            print("Step 3: Verifying results...")
            verification_input = {
                "collected_data": collection_result["collected_data"],
                "analysis": analysis_result
            }
            verification_result = await self.verification_agent.process(verification_input)
            results["steps"]["verification"] = verification_result

            if verification_result["status"] != "success":
                results["pipeline_status"] = "failed"
                return results

            # Step 4: Reporting
            print("Step 4: Generating report...")
            reporting_input = {
                "collected_data": collection_result["collected_data"],
                "analysis": analysis_result,
                "verification": verification_result
            }
            reporting_result = await self.reporting_agent.process(reporting_input)
            results["steps"]["reporting"] = reporting_result

            results["pipeline_status"] = "completed"
            results["final_report"] = reporting_result["report"]

        except Exception as e:
            results["pipeline_status"] = "failed"
            results["error"] = str(e)

        return results


# Singleton orchestrator instance
orchestrator = AgentOrchestrator()
